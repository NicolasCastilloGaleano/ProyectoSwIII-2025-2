import { lazy } from "react";
import type { RouteConfig } from "./route.interface";
import { UserRole } from "@/apps/users/services/users.interfaces";

export enum PRIVATEROUTES {
  ANALYTICS = "/insights",
  EVENTS = "/events",
  EVENTS_CREATE = "/events/:kind/new",
  EVENTS_DETAIL = "/events/:id",
  EVENTS_DISCUSSION = "/events/discussion",
  EVENTS_EDIT = "/events/:id/edit",
  EVENTS_FORUM = "/events/forum",
  EVENTS_INPERSON = "/events/inperson",
  EVENTS_VIRTUAL = "/events/virtual",
  HOMEPAGE = "/home",
  PROFILEPAGE = "/profile",
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
    element: lazy(() => import("@/apps/home/pages/profilePage")),
    path: PRIVATEROUTES.PROFILEPAGE,
  },
  {
    element: lazy(() => import("@/apps/events/pages/EventsHome")),
    path: PRIVATEROUTES.EVENTS,
  },
  {
    element: lazy(() => import("@/apps/events/pages/ForumsList")),
    path: PRIVATEROUTES.EVENTS_FORUM,
  },
  {
    element: lazy(() => import("@/apps/events/pages/DiscussionsList")),
    path: PRIVATEROUTES.EVENTS_DISCUSSION,
  },
  {
    element: lazy(() => import("@/apps/events/pages/MeetingsVirtualList")),
    path: PRIVATEROUTES.EVENTS_VIRTUAL,
  },
  {
    element: lazy(() => import("@/apps/events/pages/MeetingsInpersonList")),
    path: PRIVATEROUTES.EVENTS_INPERSON,
  },
  {
    element: lazy(() => import("@/apps/events/pages/CreateEvent")),
    path: PRIVATEROUTES.EVENTS_CREATE,
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    element: lazy(() => import("@/apps/events/pages/EventDetail")),
    path: PRIVATEROUTES.EVENTS_DETAIL,
  },
  {
    element: lazy(() => import("@/apps/events/pages/EditEvent")),
    path: PRIVATEROUTES.EVENTS_EDIT,
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    path: PRIVATEROUTES.USERS_BASE,
    children: [
      {
        path: "list",
        element: lazy(() => import("@/apps/users/pages/ListUsers")),
        roles: [UserRole.ADMIN, UserRole.STAFF],
      },
      {
        path: "create",
        element: lazy(() => import("@/apps/users/pages/ManageUser")),
        roles: [UserRole.ADMIN, UserRole.STAFF],
      },
      {
        path: "edit/:id",
        element: lazy(() => import("@/apps/users/pages/ManageUser")),
        roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.USER],
      },
    ],
  },
];
