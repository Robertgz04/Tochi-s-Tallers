import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...entradas: ClassValue[]): string {
  return twMerge(clsx(entradas));
}

const formateadorMoneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

export function formatMoney(monto: number, moneda = 'MXN'): string {
  if (moneda === 'MXN') return formateadorMoneda.format(monto);
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda,
    maximumFractionDigits: 2,
  }).format(monto);
}

export function formatNumber(valor: number): string {
  return new Intl.NumberFormat('es-MX').format(valor);
}

export function iniciales(nombre: string, apellidos: string): string {
  const primera = nombre.trim().charAt(0);
  const segunda = apellidos.trim().charAt(0);
  return (primera + segunda).toUpperCase();
}

export function nombreCompleto(nombre: string, apellidos: string): string {
  return `${nombre} ${apellidos}`.trim();
}

/** Saludo según la hora local. */
export function saludoPorHora(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
