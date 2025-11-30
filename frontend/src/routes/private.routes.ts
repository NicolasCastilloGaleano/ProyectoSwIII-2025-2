import { lazy } from "react";
import type { RouteConfig } from "./route.interface";

export enum PRIVATEROUTES {
  HOMEPAGE = "/home",
  ANALYTICS = "/insights",
  IMPROVEMENTPLAN = "/improvementplan",
  PROFILEPAGE = "/profile",
  EVENTS = "/events",
  USERS_BASE = "/users",
  USERS_CREATE = "/users/create",
  USERS_EDIT = "/users/edit/",
  USERS_LIST = "/users/list",
  USERS_PROFILE = "/users/profile",
}

export const PrivateRoutes: RouteConfig[] = [
  {
    element: lazy(() => import("@/apps/home/pages/homePage")),
    index: true,
    path: PRIVATEROUTES.HOMEPAGE,
  },
  {
    element: lazy(() => import("@/apps/home/pages/insightsPage")),
    path: PRIVATEROUTES.ANALYTICS,
  },
  {
    element: lazy(() => import("@/apps/home/pages/improvementPlan")),
    path: PRIVATEROUTES.IMPROVEMENTPLAN,
  },
  {
    element: lazy(() => import("@/apps/home/pages/profilePage")),
    path: PRIVATEROUTES.PROFILEPAGE,
  },
  {
    element: lazy(() => import("@/apps/events/pages/EventsHome")),
    path: PRIVATEROUTES.EVENTS,
  },
  { element: lazy(() => import("@/apps/events/pages/ForumsList")), path: "/events/forum" },
  { element: lazy(() => import("@/apps/events/pages/DiscussionsList")), path: "/events/discussion" },
  { element: lazy(() => import("@/apps/events/pages/MeetingsVirtualList")), path: "/events/virtual" },
  { element: lazy(() => import("@/apps/events/pages/MeetingsInpersonList")), path: "/events/inperson" },
  { element: lazy(() => import("@/apps/events/pages/CreateEvent")), path: "/events/:kind/new" },
  { element: lazy(() => import("@/apps/events/pages/EventDetail")), path: "/events/:id" },
  { element: lazy(() => import("@/apps/events/pages/EditEvent")), path: "/events/:id/edit" },
  {
    path: PRIVATEROUTES.USERS_BASE,
    roles: ["admin", "user"],
    children: [
      {
        path: "list",
        element: lazy(() => import("@/apps/users/pages/ListUsers")),
      },
      {
        path: "create",
        element: lazy(() => import("@/apps/users/pages/ManageUser")),
      },
      {
        path: "edit/:id",
        element: lazy(() => import("@/apps/users/pages/ManageUser")),
      },
    ],
  },
];
