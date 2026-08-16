import { useState } from 'react'
import './App.css'
import {createBrowserRouter, RouterProvider }from 'react-router-dom'
import React from 'react'
import HomeLayout from './Layout/HomeLayout'
import AdminLayout from './Layout/AdminLayout'
import {Toaster} from "@/components/ui/toast"

const AdminDashboard = React.lazy(()=> import("./Pages/Admin/Dashboard"))
const AdminProject = React.lazy(()=> import("./Pages/Admin/Project"))
const AdminLink = React.lazy(()=> import("./Pages/Admin/Links"))
const AdminContent = React.lazy(()=> import("./Pages/Admin/Content"))
const AdminPersonalInfo = React.lazy(()=> import("./Pages/Admin/PersonalInfo"))

const Home = React.lazy(()=> import("./Pages/Home"))

const Login = React.lazy(()=> import("./Auth/Login"))
const router = createBrowserRouter([
  {element: <HomeLayout/>, children: [
    {path: '/', element: <Home/>},
  ]},
  {
    path: "/admin",
    element: <AdminLayout/>,
    children: [
      {index: true, element: <AdminDashboard/> },
      {path: "project", element: <AdminProject/>},
      {path: "links", element: <AdminLink/>},
      {path: "contents", element: <AdminContent/>},
      {path: "personal-info", element: <AdminPersonalInfo/>}
    ]
  },
  {path: '/login', element: <Login/>}
]);
function App() {
    return (
        <>
            <RouterProvider router={router} />
            <Toaster />
        </>
    )
}

export default App
