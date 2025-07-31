import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatAppointmentDate(date: Date | string): string {
  const appointmentDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(appointmentDate)) {
    return `Hoje, ${format(appointmentDate, "HH:mm")}`;
  }
  
  if (isTomorrow(appointmentDate)) {
    return `Amanhã, ${format(appointmentDate, "HH:mm")}`;
  }
  
  if (isYesterday(appointmentDate)) {
    return `Ontem, ${format(appointmentDate, "HH:mm")}`;
  }
  
  return format(appointmentDate, "PPPP 'às' HH:mm", { locale: ptBR });
}

export function formatRelativeTime(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(targetDate, { addSuffix: true, locale: ptBR });
}

export function formatDateForInput(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return format(targetDate, "yyyy-MM-dd");
}

export function formatTimeForInput(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return format(targetDate, "HH:mm");
}
