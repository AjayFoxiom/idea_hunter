async function fetchData(
    req,
    res,
    YourModel,
    { condition, sort, populate, selectOptions, searchableFields } = {}
) {
    try {
        const pageSize = parseInt(req.query.limit) || 10;
        const pageNumber = parseInt(req.query.page) || 1;

        if (req.query?.query) {
            req.query.query = req?.query?.query.trim();
        }
        const searchQuery = req.query.query || "";

        var query = condition || {};

        if (searchQuery) {
            const searchCriteria = [];

            if (searchableFields && Array.isArray(searchableFields)) {
                // Use explicitly provided fields
                searchableFields.forEach((field) => {
                    searchCriteria.push({
                        [field]: { $regex: searchQuery, $options: "i" },
                    });
                });
            } else {
                // Fallback: Get all String fields from your model's schema
                const fields = Object.keys(YourModel.schema.paths);

                // Generate search criteria for each String field
                fields.forEach((field) => {
                    const fieldType = YourModel.schema.paths[field].instance;

                    if (fieldType === "String") {
                        searchCriteria.push({
                            [field]: { $regex: searchQuery, $options: "i" },
                        });
                    }
                });
            }

            if (searchCriteria.length > 0) {
                if (query.$or) {
                    // If query already has an $or, we must wrap both in an $and to preserve both logics
                    query.$and = query.$and || [];
                    query.$and.push({ $or: query.$or });
                    query.$and.push({ $or: searchCriteria });
                    delete query.$or;
                } else {
                    query.$or = searchCriteria;
                }
            }
        }

        const options = {
            sort: sort, // Sorting options
            select: selectOptions, // Select options
        };

        if (req.query.page) {
            options.skip = (pageNumber - 1) * pageSize;
            options.limit = pageSize;
        }

        query = {
            $and: [
                query,
                { $or: [{ isDeleted: false }, { isDeleted: { $ne: true } }] },
            ],
        };

        const totalDocs = await YourModel.countDocuments(query); // Retrieve total count

        const docs = await YourModel.find(query, null, {
            collation: { locale: "en", strength: 2 },
            ...options,
        })
            .populate(populate)
            .lean();

        const hasNextPage = totalDocs > pageSize * pageNumber;
        const hasPreviousPage = pageNumber > 1;

        return { docs, totalDocs, hasNextPage, hasPreviousPage };
    } catch (error) {
        throw error;
    }
}

module.exports = fetchData;
