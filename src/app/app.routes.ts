import { Routes } from '@angular/router';
import { HomePage } from './features/home/pages/home.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  { 
    path: 'imc', 
    loadComponent: () => import('./features/imc/pages/imc.page').then(m => m.ImcPage)
  },
  { 
    path: 'juros', 
    loadComponent: () => import('./features/juros/pages/juros.page').then(m => m.JurosPage)
  },
  { 
    path: 'regra-de-tres', 
    loadComponent: () => import('./features/regra-de-tres/pages/regra-de-tres.page').then(m => m.RegraDeTresPage)
  },
  { 
    path: 'matriz', 
    loadComponent: () => import('./features/matriz/pages/matriz.page').then(m => m.MatrizPage)
  },
  { 
    path: 'operacoes-basicas', 
    loadComponent: () => import('./features/operacoes-basicas/pages/operacoes-basicas.page').then(m => m.OperacoesBasicasPage)
  },
  { 
    path: 'funcao-1', 
    loadComponent: () => import('./features/funcao-1/pages/funcao-1.page').then(m => m.Funcao1Page)
  },
  { 
    path: 'funcao-2', 
    loadComponent: () => import('./features/funcao-2/pages/funcao-2.page').then(m => m.Funcao2Page)
  },
];