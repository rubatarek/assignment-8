import { Router } from 'express';
import {
    createBooksCollection,
    createCappedLogsCollection,
    createBooksIndex,
    insertAuthor,
    insertBook,
    insertBooks,
    insertLog,
    updateBookByTitle,
    findBookByTitle,
    findBooksByYearRange,
    findBooksByGenre,
    findBooksSkipLimit,
    findBooksWithIntegerYear,
    findBooksExcludingGenres,
    deleteBooksBefore,
    aggregateBooksSortedByYear,
    aggregateBooksProjected,
    aggregateUnwindGenres,
    aggregateBooksWithLogs
} from './book.service.js';

const router = Router();

router.post('/collection/books', async (req, res) => {
    let result = await createBooksCollection();
    res.json(result);
});

router.post('/collection/logs/capped', async (req, res) => {
    let result = await createCappedLogsCollection();
    res.json(result);
});

router.post('/collection/books/index', async (req, res) => {
    let result = await createBooksIndex();
    res.json(result);
});

router.post('/collection/authors', async (req, res) => {
    let result = await insertAuthor(req.body);
    res.json(result);
});

router.post('/books', async (req, res) => {
    let result = await insertBook(req.body);
    res.json(result);
});

router.post('/books/batch', async (req, res) => {
    let result = await insertBooks(req.body);
    res.json(result);
});

router.post('/logs', async (req, res) => {
    let result = await insertLog(req.body);
    res.json(result);
});

router.patch('/books/:title', async (req, res) => {
    let result = await updateBookByTitle(req.params.title, req.body);
    res.json(result);
});

router.get('/books/title', async (req, res) => {
    let result = await findBookByTitle(req.query.title);
    res.json(result);
});

router.get('/books/year', async (req, res) => {
    let result = await findBooksByYearRange(parseInt(req.query.from), parseInt(req.query.to));
    res.json(result);
});

router.get('/books/genre', async (req, res) => {
    let result = await findBooksByGenre(req.query.genre);
    res.json(result);
});

router.get('/books/skip-limit', async (req, res) => {
    let result = await findBooksSkipLimit();
    res.json(result);
});

router.get('/books/year-integer', async (req, res) => {
    let result = await findBooksWithIntegerYear();
    res.json(result);
});

router.get('/books/exclude-genres', async (req, res) => {
    let result = await findBooksExcludingGenres();
    res.json(result);
});

router.delete('/books/before-year', async (req, res) => {
    let result = await deleteBooksBefore(parseInt(req.query.year));
    res.json(result);
});

router.get('/books/aggregate1', async (req, res) => {
    let result = await aggregateBooksSortedByYear();
    res.json(result);
});

router.get('/books/aggregate2', async (req, res) => {
    let result = await aggregateBooksProjected();
    res.json(result);
});

router.get('/books/aggregate3', async (req, res) => {
    let result = await aggregateUnwindGenres();
    res.json(result);
});

router.get('/books/aggregate4', async (req, res) => {
    let result = await aggregateBooksWithLogs();
    res.json(result);
});

export default router;