// src/routes/postRoutes.js

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const { getUserIdMIddleware } = require('../middlewares/getUserIdMiddleware');

// Rotas de Posts existentes (apenas para referência)
// router.get('/', postController.getAllPosts); // Será substituída/complementada por searchPosts
router.get('/:id', getUserIdMIddleware, postController.getPostById);
router.post('/', authMiddleware.verifyToken, postController.createPost);

// Nova rota para buscar/pesquisar posts
router.get('/', postController.searchPosts); // Agora esta rota vai lidar com a busca e todos os posts

// Rotas para interações (curtir/descurtir e favoritar/desfavoritar)
router.post('/:postId/like', authMiddleware.verifyToken, postController.toggleLike);
router.post('/:postId/favorite', authMiddleware.verifyToken, postController.toggleFavorite);

router.delete("/:id", authMiddleware.verifyToken, postController.deletePost);

module.exports = router;