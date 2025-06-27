import React, { useState, useEffect } from 'react';
import { FaChartBar, FaChartPie, FaChartLine, FaDownload, FaThumbsUp, FaTrophy, FaEye, FaCalendarAlt, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Spinner from '../../components/layout/Spinner';
import { toast } from 'react-toastify';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const CONFIG = {
  timeframes: {
    'trimestre': { months: 3, label: 'Dernier trimestre' },
    'semestre': { months: 6, label: 'Dernier semestre' },
    'annee': { months: 12, label: 'Dernière année' }
  },
  statusMap: {
    'attente': { text: 'En attente', color: 'bg-red-100 text-red-800', badge: 'status-attente' },
    'cours': { text: 'En cours', color: 'bg-yellow-100 text-yellow-800', badge: 'status-cours' },
    'résolu': { text: 'Résolu', color: 'bg-green-100 text-green-800', badge: 'status-resolu' }
  },
  voteRanges: ['0', '1-5', '6-10', '11-20', '21+'],
  tabs: [
    { id: 'overview', icon: FaChartBar, label: 'Vue d\'ensemble' },
    { id: 'votes', icon: FaThumbsUp, label: 'Classement par votes' },
    { id: 'trends', icon: FaChartLine, label: 'Évolution temporelle' }
  ]
};

const StatCard = ({ title, value, icon, subtitle }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {icon}
    </div>
    <p className="text-4xl font-bold text-gray-800">{value}</p>
    {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
      active ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    <Icon className="inline mr-2" /> {children}
  </button>
);

const ProgressBar = ({ value, max, color = "blue" }) => (
  <div className="w-20 bg-gray-200 rounded-full h-2">
    <div className={`bg-${color}-500 h-2 rounded-full`} style={{ width: max > 0 ? `${(value / max * 100)}%` : '0%' }} />
  </div>
);

const ExportModal = ({ show, onClose, onExport }) => show && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Choisir le format d'export</h2>
      <div className="space-y-4">
        {[
          { type: 'Complet', icon: FaFilePdf, color: 'text-red-600', desc: 'Analyse complète avec recommandations et métriques détaillées' },
          { type: 'Synthèse', icon: FaFileExcel, color: 'text-green-600', desc: 'Résumé concis pour présentation rapide' }
        ].map(({ type, icon: Icon, color, desc }) => (
          <button key={type} onClick={() => onExport(type)} className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 text-left transition-colors">
            <div className="flex items-center mb-2">
              <Icon className={`${color} text-2xl mr-3`} />
              <h3 className="text-lg font-semibold">{type}</h3>
            </div>
            <p className="text-gray-600 text-sm">{desc}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={onClose} className="btn bg-gray-100 text-gray-800 hover:bg-gray-200">Annuler</button>
      </div>
    </div>
  </div>
);

const useStatisticsData = (timeframe) => {
  const [data, setData] = useState({ stats: null, signalementsByMonth: [], topSignalements: [], voteStats: null, isLoading: true });

  const generateStats = (signalements) => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - CONFIG.timeframes[timeframe].months, 1);
    const months = {};
    
    for (let d = new Date(startDate); d <= now; d.setMonth(d.getMonth() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { month: key, count: 0, attente: 0, cours: 0, résolu: 0, totalVotes: 0 };
    }
    
    const totalVotes = signalements.reduce((sum, s) => sum + (s.compteurVotes || 0), 0);
    const voteRanges = Object.fromEntries(CONFIG.voteRanges.map(range => [range, 0]));
    
    signalements.forEach(s => {
      const date = new Date(s.dateCréation);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[monthKey]) {
        months[monthKey].count++;
        months[monthKey].totalVotes += s.compteurVotes || 0;
        months[monthKey][s.statut]++;
      }
      
      const votes = s.compteurVotes || 0;
      if (votes === 0) voteRanges['0']++;
      else if (votes <= 5) voteRanges['1-5']++;
      else if (votes <= 10) voteRanges['6-10']++;
      else if (votes <= 20) voteRanges['11-20']++;
      else voteRanges['21+']++;
    });

    return {
      signalementsByMonth: Object.values(months).sort((a, b) => a.month.localeCompare(b.month)),
      topSignalements: signalements.filter(s => s.compteurVotes > 0).sort((a, b) => (b.compteurVotes || 0) - (a.compteurVotes || 0)).slice(0, 10).map((s, i) => ({ ...s, rank: i + 1 })),
      voteStats: {
        totalVotes,
        avgVotes: (totalVotes / signalements.length).toFixed(1),
        maxVotes: Math.max(...signalements.map(s => s.compteurVotes || 0)),
        signalementsSansVotes: signalements.filter(s => (s.compteurVotes || 0) === 0).length,
        pourcentageSansVotes: ((signalements.filter(s => (s.compteurVotes || 0) === 0).length / signalements.length) * 100).toFixed(1),
        distribution: voteRanges
      }
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, signalRes] = await Promise.all([api.get('/signalements/stats'), api.get('/signalements')]);
        const computed = generateStats(signalRes.data.data);
        setData({ stats: statsRes.data.data, ...computed, isLoading: false });
      } catch (err) {
        toast.error('Erreur lors du chargement des données');
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };
    fetchData();
  }, [timeframe]);

  return data;
};

const ExportService = {
  formatMonth: (monthKey) => new Date(parseInt(monthKey.split('-')[0]), parseInt(monthKey.split('-')[1]) - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
  
  generateHTML: (data, type) => {
    const { stats, signalementsByMonth, topSignalements, voteStats } = data;
    const dateGeneration = moment().format('DD/MM/YYYY à HH:mm');
    
    const baseStyles = `* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; } .container { max-width: 1200px; margin: 0 auto; padding: 20px; } .header { text-align: center; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; } .logo { font-size: 2.5em; font-weight: bold; color: #4F46E5; } .section { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; } .section-title { font-size: 1.5em; color: #4F46E5; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; } .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; } .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .stat-value { font-size: 2.5em; font-weight: bold; color: #4F46E5; } .table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; } .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; } .table th { background: #4F46E5; color: white; } .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.8em; } .status-attente { background: #fee2e2; color: #dc2626; } .status-cours { background: #fef3c7; color: #d97706; } .status-resolu { background: #d1fae5; color: #059669; } .alert { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 15px; border-radius: 4px; margin: 10px 0; } .success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 15px; border-radius: 4px; margin: 10px 0; }`;
    
    const sections = {
      executive: () => `<div class="section"><h2 class="section-title">📊 Résumé Exécutif</h2><div class="stats-grid">${[
        { label: 'Total Signalements', value: stats?.totalSignalements || 0 },
        { label: 'Taux de Résolution', value: `${stats?.resolutionRate?.toFixed(1) || 0}%` },
        { label: 'Total Votes', value: voteStats?.totalVotes || 0 },
        { label: 'Moyenne Votes', value: voteStats?.avgVotes || 0 }
      ].map(({ label, value }) => `<div class="stat-card"><div class="stat-value">${value}</div><div>${label}</div></div>`).join('')}</div></div>`,
      
      status: () => `<div class="section"><h2 class="section-title">📈 Répartition par Statut</h2><table class="table"><thead><tr><th>Statut</th><th>Nombre</th><th>Pourcentage</th></tr></thead><tbody>${stats?.statsByStatus?.map(s => {
        const cfg = CONFIG.statusMap[s._id];
        const pct = ((s.count / stats.totalSignalements) * 100).toFixed(1);
        return `<tr><td><span class="status-badge ${cfg.badge}">${cfg.text}</span></td><td><strong>${s.count}</strong></td><td>${pct}%</td></tr>`;
      }).join('') || '<tr><td colspan="3">Aucune donnée</td></tr>'}</tbody></table></div>`,
      
      top: () => `<div class="section"><h2 class="section-title">🏆 Top Signalements</h2><table class="table"><thead><tr><th>Rang</th><th>Titre</th><th>Votes</th><th>Statut</th></tr></thead><tbody>${topSignalements.slice(0, 5).map(s => `<tr><td><strong>#${s.rank}</strong></td><td>${s.titre}</td><td><strong style="color: #3b82f6;">👍 ${s.compteurVotes}</strong></td><td><span class="status-badge ${CONFIG.statusMap[s.statut].badge}">${CONFIG.statusMap[s.statut].text}</span></td></tr>`).join('')}</tbody></table></div>`,
      
      recommendations: () => {
        const resRate = stats?.resolutionRate || 0;
        const alert = resRate < 50 ? 'CRITIQUE: Taux résolution faible' : resRate < 75 ? 'ATTENTION: Taux modéré' : 'EXCELLENT: Taux élevé';
        const alertClass = resRate < 50 ? 'alert' : resRate < 75 ? 'alert' : 'success';
        return `<div class="section"><h2 class="section-title">🎯 Recommandations</h2><div class="${alertClass}"><strong>${alert}</strong></div></div>`;
      }
    };
    
    const content = type === 'Complet' ? 
      [sections.executive(), sections.status(), sections.top(), sections.recommendations()].join('') :
      sections.executive();
    
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Rapport MogaAlert - ${type}</title><style>${baseStyles}</style></head><body><div class="container"><div class="header"><div class="logo">🏛️ MogaAlert</div><div>Rapport ${type} - ${dateGeneration}</div></div>${content}<div style="text-align: center; margin-top: 40px; color: #666;"><strong>MogaAlert</strong> - Généré le ${dateGeneration}</div></div></body></html>`;
  },
  
  download: (data, type) => {
    try {
      const content = ExportService.generateHTML(data, type);
      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MogaAlert_${type}_${moment().format('YYYY-MM-DD_HH-mm')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Rapport ${type} généré !`);
    } catch (error) {
      toast.error('Erreur lors de la génération');
    }
  }
};

const Statistiques = () => {
  const [timeframe, setTimeframe] = useState('annee');
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  
  const { stats, signalementsByMonth, topSignalements, voteStats, isLoading } = useStatisticsData(timeframe);

  const handleExport = (type) => {
    ExportService.download({ stats, signalementsByMonth, topSignalements, voteStats }, type);
    setShowExportModal(false);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Statistiques Avancées</h1>
        <button onClick={() => setShowExportModal(true)} className="btn bg-primary-600 text-white hover:bg-primary-700 flex items-center">
          <FaDownload className="mr-2" /> Exporter Rapport
        </button>
      </div>

      <ExportModal show={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExport} />

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {CONFIG.tabs.map(({ id, icon, label }) => (
              <TabButton key={id} active={activeTab === id} onClick={() => setActiveTab(id)} icon={icon}>{label}</TabButton>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total signalements" value={stats.totalSignalements} icon={<FaChartBar className="text-blue-500 text-2xl" />} />
            <StatCard title="Total votes" value={voteStats?.totalVotes || 0} icon={<FaThumbsUp className="text-green-500 text-2xl" />} subtitle={`Moyenne: ${voteStats?.avgVotes || 0}`} />
            <StatCard title="Record votes" value={voteStats?.maxVotes || 0} icon={<FaTrophy className="text-yellow-500 text-2xl" />} subtitle="Plus populaire" />
            <StatCard title="Taux résolution" value={`${stats.resolutionRate?.toFixed(1)}%`} icon={<div className="w-3 h-3 rounded-full bg-green-500" />} subtitle={`${stats.statsByStatus?.find(s => s._id === 'résolu')?.count || 0} résolus`} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Répartition par catégorie</h2>
              <FaChartPie className="text-primary-500 text-2xl" />
            </div>
            {stats?.statsByCategory?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.statsByCategory.map((category, index) => (
                  <div key={category._id} className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: `hsl(${index * 30}, 70%, 60%)` }} />
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">{category.categoryName || 'Inconnue'}</span>
                        <span className="text-sm text-gray-500">{category.count} ({(category.count / stats.totalSignalements * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="h-2 rounded-full" style={{ width: `${(category.count / stats.totalSignalements * 100)}%`, backgroundColor: `hsl(${index * 30}, 70%, 60%)` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 italic">Aucune donnée disponible</p>}
          </div>
        </>
      )}

      {activeTab === 'votes' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { title: 'Distribution des votes', content: voteStats?.distribution && Object.entries(voteStats.distribution).map(([range, count]) => (
                <div key={range} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{range === '0' ? 'Aucun vote' : `${range} votes`}</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">{count}</span>
                    <ProgressBar value={count} max={stats?.totalSignalements || 0} color="blue" />
                  </div>
                </div>
              )) },
              { title: 'Participation citoyenne', content: (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{voteStats?.pourcentageSansVotes}%</p>
                    <p className="text-sm text-gray-500">Sans votes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{voteStats ? (100 - parseFloat(voteStats.pourcentageSansVotes)).toFixed(1) : 0}%</p>
                    <p className="text-sm text-gray-500">Avec votes</p>
                  </div>
                </div>
              ) },
              { title: 'Métriques clés', content: (
                <div className="space-y-3">
                  {[['Total votes', voteStats?.totalVotes || 0], ['Moyenne', voteStats?.avgVotes || 0], ['Maximum', voteStats?.maxVotes || 0]].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-sm text-gray-600">{label}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              ) }
            ].map(({ title, content }, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
                <div className="space-y-2">{content}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">🏆 Top 10 des signalements populaires</h2>
            {topSignalements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>{['Rang', 'Signalement', 'Catégorie', 'Votes', 'Statut', 'Date', 'Action'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topSignalements.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {s.rank <= 3 && <FaTrophy className={`mr-2 ${s.rank === 1 ? 'text-yellow-500' : s.rank === 2 ? 'text-gray-400' : 'text-orange-400'}`} />}
                            <span className="text-lg font-bold">#{s.rank}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{s.titre}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{s.description.substring(0, 50)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.catégorie?.nomCategorie || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaThumbsUp className="text-blue-500 mr-2" />
                            <span className="text-lg font-bold text-blue-600">{s.compteurVotes}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${CONFIG.statusMap[s.statut].color}`}>
                            {CONFIG.statusMap[s.statut].text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            {moment(s.dateCréation).format('DD/MM/YYYY')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link to={`/signalements/${s._id}`} className="text-primary-600 hover:text-primary-900 flex items-center justify-end">
                            <FaEye className="mr-1" />Voir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-gray-500 italic">Aucun signalement avec votes</p>}
          </div>
        </>
      )}

      {activeTab === 'trends' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Évolution des signalements</h2>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500">
              {Object.entries(CONFIG.timeframes).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          {signalementsByMonth.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>{['Mois', 'Total', 'En attente', 'En cours', 'Résolus', 'Total Votes'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {signalementsByMonth.map(month => (
                    <tr key={month.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ExportService.formatMonth(month.month)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{month.count}</td>
                      {['attente', 'cours', 'résolu'].map((status, i) => (
                        <td key={status} className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">{month[status]}</span>
                            <ProgressBar value={month[status]} max={month.count} color={['red', 'yellow', 'green'][i]} />
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaThumbsUp className="text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-blue-600">{month.totalVotes}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-gray-500 italic">Aucune donnée disponible</p>}
        </div>
      )}
    </div>
  );
};

export default Statistiques;