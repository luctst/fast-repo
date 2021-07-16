import axios from 'axios';
import macros from '../pipe/macros.js';

export default axios.create({
  baseURL: macros.githubAPI,
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
  timeout: 5000,
});
