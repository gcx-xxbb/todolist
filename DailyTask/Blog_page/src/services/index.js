import api from './api';

export const userApi = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.post('/users/me/update', data),
  changePassword: (data) => api.post('/users/change-password', data),
  getUserById: (id) => api.get(`/users/${id}`),
  getAllUsers: () => api.get('/users')
};

export const articleApi = {
  getArticles: (params) => api.get('/articles', { params }),
  getArticleById: (id) => api.get(`/articles/${id}`),
  getMyArticles: () => api.get('/articles/my'),
  createArticle: (data) => api.post('/articles', data),
  updateArticle: (id, data) => api.post(`/articles/${id}/update`, data),
  deleteArticle: (id) => api.post(`/articles/${id}/delete`),
  likeArticle: (id) => api.post(`/articles/${id}/like`),
  favoriteArticle: (id) => api.post(`/articles/${id}/favorite`),
  getRelatedArticles: (id) => api.get(`/articles/${id}/related`)
};

export const commentApi = {
  getCommentsByArticle: (articleId, params) => api.get(`/comments/article/${articleId}`, { params }),
  createComment: (data) => api.post('/comments', data),
  updateComment: (id, data) => api.post(`/comments/${id}/update`, data),
  deleteComment: (id) => api.post(`/comments/${id}/delete`),
  likeComment: (id) => api.post(`/comments/${id}/like`)
};

export const categoryApi = {
  getCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.post(`/categories/${id}/update`, data),
  deleteCategory: (id) => api.post(`/categories/${id}/delete`)
};

export const tagApi = {
  getTags: () => api.get('/tags'),
  getTagById: (id) => api.get(`/tags/${id}`),
  getTagBySlug: (slug) => api.get(`/tags/slug/${slug}`),
  createTag: (data) => api.post('/tags', data),
  updateTag: (id, data) => api.post(`/tags/${id}/update`, data),
  deleteTag: (id) => api.post(`/tags/${id}/delete`)
};