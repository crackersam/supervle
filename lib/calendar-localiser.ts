// lib/calendar-localiser-moment.ts
import moment from "moment-timezone";
import { momentLocalizer } from "react-big-calendar";

// 1) Tell Moment which IANA zone to use
moment.tz.setDefault("Europe/London");

// 2) Create the Big Calendar localizer
export const localizer = momentLocalizer(moment);
