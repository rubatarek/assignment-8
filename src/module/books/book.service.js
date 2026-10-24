import { databaseConnection } from '../../database/connection.js';

const getDb = () => databaseConnection();

export async function createBooksCollection() {
    const db = await getDb();
    try {
        await db.createCollection('books', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['title'],
                    properties: {
                        title: {
                            bsonType: 'string',
                            minLength: 1,
                            description: 'must be a non-empty string'
                        }
                    }
                }
            }
        });
    } catch (err) {
        if (!(err?.codeName === 'NamespaceExists' || err?.code === 48)) throw err;
    }
    return { ok: 1 };
}

export async function createCappedLogsCollection() {
    const db = await getDb();
    try {
        await db.createCollection('logs', { capped: true, size: 1024 * 1024 });
    } catch (err) {
        if (err?.codeName !== 'NamespaceExists') throw err;
    }
    return { ok: 1 };
}

export async function createBooksIndex() {
    const db = await getDb();
    const result = await db.collection('books').createIndex({ title: 1 });
    return result; // returns "title_1"
}

export async function insertAuthor(data) {
    const db = await getDb();
    const doc = Object.keys(data || {}).length ? data : { name: 'Unknown Author' };
    const result = await db.collection('authors').insertOne(doc);
    return { acknowledged: result.acknowledged, insertedId: result.insertedId };
}

export async function insertBook(data) {
    const db = await getDb();
    const doc = Object.keys(data || {}).length ? data : { title: 'Untitled' };
    const result = await db.collection('books').insertOne(doc);
    return { acknowledged: result.acknowledged, insertedId: result.insertedId };
}

export async function insertBooks(docs) {
    const db = await getDb();
    if (!Array.isArray(docs) || docs.length < 3) {
        throw new Error('provide an array of at least 3 book objects');
    }
    const result = await db.collection('books').insertMany(docs);
    return { acknowledged: result.acknowledged, insertedIds: result.insertedIds };
}

export async function insertLog(data) {
    const db = await getDb();
    const doc = Object.keys(data || {}).length ? data : { message: 'Default log message' };
    const result = await db.collection('logs').insertOne(doc);
    return { acknowledged: result.acknowledged, insertedId: result.insertedId };
}

export async function updateBookByTitle(title, updateData) {
    const db = await getDb();
    const result = await db.collection('books').updateOne({ title }, { $set: updateData });
    return { acknowledged: result.acknowledged, matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

export async function findBookByTitle(title) {
    const db = await getDb();
    const result = await db.collection('books').findOne({ title: title.trim() });
    return result;
}

export async function findBooksByYearRange(from, to) {
    const db = await getDb();
    return db.collection('books').find({ year: { $gte: from, $lte: to } }).toArray();
}

export async function findBooksByGenre(genre) {
    const db = await getDb();
    return db.collection('books').find({ genres: genre }).toArray();
}

export async function findBooksSkipLimit() {
    const db = await getDb();
    return db.collection('books').find({}).sort({ year: -1 }).skip(2).limit(3).toArray();
}

export async function findBooksWithIntegerYear() {
    const db = await getDb();
    return db.collection('books').find({ year: { $type: 'int' } }).toArray();
}

export async function findBooksExcludingGenres() {
    const db = await getDb();
    return db.collection('books').find({
        genres: { $not: { $elemMatch: { $in: ['Horror', 'Science Fiction'] } } }
    }).toArray();
}

export async function deleteBooksBefore(year) {
    const db = await getDb();
    const result = await db.collection('books').deleteMany({ year: { $lt: year } });
    return { acknowledged: result.acknowledged, deletedCount: result.deletedCount };
}

export async function aggregateBooksSortedByYear() {
    const db = await getDb();
    return db.collection('books').aggregate([
        { $match: { year: { $gt: 2000 } } },
        { $sort: { year: -1 } }
    ]).toArray();
}

export async function aggregateBooksProjected() {
    const db = await getDb();
    return db.collection('books').aggregate([
        { $match: { year: { $gt: 2000 } } },
        { $project: { _id: 0, title: 1, author: 1, year: 1 } }
    ]).toArray();
}

export async function aggregateUnwindGenres() {
    const db = await getDb();
    return db.collection('books').aggregate([
        { $unwind: '$genres' },
        { $project: { _id: 0, title: 1, genres: '$genres' } }
    ]).toArray();
}

export async function aggregateBooksWithLogs() {
    const db = await getDb();
    const result = await db.collection('books').aggregate([
        { $lookup: { from: 'logs', localField: '_id', foreignField: 'book_id', as: 'logs' } },
        { $project: { title: 1, author: 1, year: 1, logs: 1 } }
    ]).toArray();

    return result.map(book => ({
        action: book.logs?.[0]?.action ?? book.logs?.[0]?.status ?? book.logs?.[0]?.message ?? null,
        book_details: {
            title: book.title ?? null,
            author: book.author ?? null,
            year: book.year ?? null
        }
    }));
}