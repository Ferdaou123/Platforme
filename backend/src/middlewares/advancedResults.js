const advancedResults = (model, populate = [], selectFields = '') => {
  return async (req, res, next) => {
    try {
      let query;
      const reqQuery = { ...req.query };
      const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
      removeFields.forEach(param => delete reqQuery[param]);

      let queryStr = JSON.stringify(reqQuery);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
      let baseQuery = JSON.parse(queryStr);

      if (req.query.search) {
        const searchTerm = req.query.search.trim();
        if (searchTerm) {
          const searchRegex = new RegExp(searchTerm, 'i');
          baseQuery.$or = [
            { nom: searchRegex },
            { email: searchRegex },
            { titre: searchRegex },
            { description: searchRegex },
            { nomCategorie: searchRegex },
            { nomService: searchRegex }
          ];
        }
      }

      if (req.query.distance && req.query.lat && req.query.lng) {
        const radius = parseInt(req.query.distance) / 6378.1;
        baseQuery.position = {
          $geoWithin: { 
            $centerSphere: [
              [parseFloat(req.query.lng), parseFloat(req.query.lat)], 
              radius
            ] 
          }
        };
      }

      query = model.find(baseQuery);

      if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
      } else if (selectFields) {
        query = query.select(selectFields);
      }

      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        if (model.modelName === 'Signalement') {
          query = query.sort('-dateCréation');
        } else if (model.modelName === 'Utilisateur') {
          query = query.sort('nom');
        } else {
          query = query.sort('-createdAt');
        }
      }

      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const total = await model.countDocuments(baseQuery);

      query = query.skip(startIndex).limit(limit);

      if (populate && populate.length > 0) {
        populate.forEach(pop => {
          if (typeof pop === 'string') {
            query = query.populate(pop);
          } else if (typeof pop === 'object') {
            query = query.populate(pop);
          }
        });
      }

      const results = await query;

      const totalPages = Math.ceil(total / limit);
      const pagination = {
        page,
        limit,
        total,
        pages: totalPages
      };

      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit
        };
      }

      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit
        };
      }

      const hasResults = results.length > 0;
      const isLastPage = page >= totalPages;
      const isFirstPage = page === 1;

      res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        hasResults,
        isFirstPage,
        isLastPage,
        data: results
      };

      next();
    } catch (error) {
      res.advancedResults = {
        success: false,
        count: 0,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        },
        hasResults: false,
        isFirstPage: true,
        isLastPage: true,
        data: [],
        error: error.message
      };

      next();
    }
  };
};

module.exports = advancedResults;