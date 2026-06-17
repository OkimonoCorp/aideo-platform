import {Temporal} from '@js-temporal/polyfill';
globalThis.Temporal = Temporal;

// Fuseau horaire du méridien de greenwich (UTC + 0) pour le bon fonctionnement de Temporal
const DEFAULT_TIMEZONE = '[Europe/London]'

export function DateFromString(dateString, timeZone = DEFAULT_TIMEZONE) {
    return Temporal.ZonedDateTime.from(dateString + timeZone);
}

export function TimeBetweenDatesMinutes(date1, date2) {
    return date1.since(date2).total({unit: 'minutes'});
}

export function TimeFromNowMinutes(date) {
    return TimeBetweenDatesMinutes(Temporal.Now.plainDateTimeISO(), date)
}