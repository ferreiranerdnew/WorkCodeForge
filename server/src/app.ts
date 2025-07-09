require('dotenv').config();

import express, { Application, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import usersProjectsRouter from './routes/users_projects';
import tasksRouter from './routes/tasks';
import usersTasksRouter from './routes/users_tasks';
import meetingsRouter from './routes/meetings';
import usersMeetingsRouter from './routes/users_meetings';
import messagesRouter from './routes/messages';
import usersRouter from './routes/users';

import { getLoc, getPersonByGitHub, saveLoc } from './models/person';
import { socketServer } from './socketServer';

// Inicialização
const app: Application = express();
const port = process.env.PORT || 5001;

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Configurações de cookie/session
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_KEY || 'default_key'],
  maxAge: 24 * 60 * 60 * 1000, // 1 dia
}));

// Passport
require('./config/');
app.use(passport.initialize());
app.use(passport.session());

// Middleware para JSON
app.use(express.json());

// Rotas
app.use('/auth', authRouter);
app.use('/projects', projectsRouter);
app.use('/users_projects', usersProjectsRouter);
app.use('/tasks', tasksRouter);
app.use('/users_tasks', usersTasksRouter);
app.use('/meetings', meetingsRouter);
app.use('/users_meetings', usersMeetingsRouter);
app.use('/messages', messagesRouter);
app.use('/users', usersRouter);

// Middleware de autenticação
const authCheck = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      authenticated: false,
      message: 'User has not been authenticated',
    });
  }
  next();
};

// Rota autenticada principal
app.get('/', authCheck, (req: Request, res: Response) => {
  res.status(200).json({
    authenticated: true,
    message: 'User successfully authenticated',
    user: req.user,
    cookies: req.cookies,
  });
});

// // Logout
// app.get('/logout', (req: Request, res: Response) => {
//   req.logout(() => {
//     res.redirect(process.env.CLIENT_URL || '/');
//   });
// });
// Logout (recomendo tratar o callback do req.logout para evitar problemas)
app.get('/logout', (req: Request, res: Response) => {
  req.logout(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout error');
    }
    // Redireciona para a URL do cliente (frontend) após logout
    res.redirect(process.env.CLIENT_URL || '/');
  });
});

// Retornar dados do usuário autenticado
app.get('/user', async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const reqUser = req.user as any;
    const user = await getPersonByGitHub(reqUser.oauth_id);
    console.log('User authenticated');
    return res.status(200).send(user.rows[0]);
  }
  console.log('Not logged in or not authenticated');
  return res.status(401).send('Not authenticated');
});

// Salvando localização
app.post('/loc', async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const reqUser = req.user as any;
    const loc: string = req.body.loc;
    await saveLoc(reqUser.oauth_id, loc);
    return res.status(200).send('Saved');
  }
  return res.status(401).send('Not authenticated');
});

// Interfaces para dados de localização
interface LocData {
  user: UserLoc;
  others: OtherLoc[];
}

interface OtherLoc {
  lat: number;
  lng: number;
}

interface UserLoc extends OtherLoc {
  name: string;
}

// Retornar localização dos usuários
app.get('/loc', async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const reqUser = req.user as any;
    const githubId = reqUser.oauth_id;
    const data = await getLoc();

    const result: LocData = {
      user: { lat: 0, lng: 0, name: '' },
      others: [],
    };

    for (let userLocObj of data.rows) {
      if (!userLocObj.lat || !userLocObj.lng) continue;

      if (userLocObj.oauth_id === githubId) {
        result.user = {
          lat: userLocObj.lat,
          lng: userLocObj.lng,
          name: userLocObj.name,
        };
      } else {
        result.others.push({
          lat: userLocObj.lat,
          lng: userLocObj.lng,
        });
      }
    }

    return res.status(200).send(result);
  }

  return res.status(401).send('Not authenticated');
});

// Start Server
app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});

// WebSocket
socketServer.listen(5080, () => {
  console.log('📡 WebSocket server running on port 5080');
});
