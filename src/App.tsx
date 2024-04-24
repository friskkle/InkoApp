import React from 'react';
import { createBrowserRouter, RouterProvider, useParams } from "react-router-dom"
import PrivateRoute from './components/PrivateRoute';
import AuthContext from './context/AuthContext';
import {Home, Vocabulary, Start, Signup, Signin, NewUser, JapaneseLearn, MandarinLearn, Profile, Hub, JPQuiz, Wallet, PostPage, SocialProfile, Following} from './pages/index'

const App: React.FC = () => {
  const router = createBrowserRouter([
    {
      path:'/',
      element:<Start/>
    },
    {
      path:'/login',
      element:<Signin/>
    },
    {
      path:'/signup',
      element:<Signup/>
    },
    {
      path:'/newuser',
      element:<PrivateRoute><NewUser/></PrivateRoute>
    },
    {
      path:'/home',
      element:<PrivateRoute><Home/></PrivateRoute>
    },
    {
      path:'/profile',
      element: <PrivateRoute><Profile/></PrivateRoute>
    },
    {
      path:'/vocabulary',
      element:<PrivateRoute><Vocabulary/></PrivateRoute>
    },
    {
      path:'/learnjp',
      element:<PrivateRoute><JapaneseLearn/></PrivateRoute>
    },
    {
      path:'/learnzh',
      element:<PrivateRoute><MandarinLearn/></PrivateRoute>
    },
    {
      path:'/social',
      element:<PrivateRoute><Hub/></PrivateRoute>
    },
    {
      path:'/jpquiz',
      element:<PrivateRoute><JPQuiz/></PrivateRoute>
    },
    {
      path:'/wallet',
      element:<PrivateRoute><Wallet/></PrivateRoute>
    },
    {
      path:'/social/post/:postId',
      element:<PrivateRoute><PostPage/></PrivateRoute>
    },
    {
      path:'/social/profile/:username',
      element:<PrivateRoute><SocialProfile/></PrivateRoute>
    },
    {
      path:'/social/:username/following',
      element:<PrivateRoute><Following/></PrivateRoute>
    }
  ])
  return (
    <AuthContext>
      <RouterProvider router={router}></RouterProvider>
    </AuthContext>
  );
}

export default App;
