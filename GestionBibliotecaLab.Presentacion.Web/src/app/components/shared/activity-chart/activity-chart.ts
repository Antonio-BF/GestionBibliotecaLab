import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';

export interface SerieActividad {
  nombre: string;
  color: string;
  datos: { periodo: string; cantidad: number }[];
}

interface ColumnaActividad {
  etiqueta: string;
  valores: { cantidad: number; color: string; nombre: string }[];
}

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './activity-chart.html',
  styleUrl: './activity-chart.css',
})
export class ActivityChart {
  readonly series = input.required<SerieActividad[]>();

  readonly columnas = computed<ColumnaActividad[]>(() => {
    const periodos = new Set<string>();
    this.series().forEach((s) => s.datos.forEach((d) => periodos.add(d.periodo)));
    const periodosOrdenados = [...periodos].sort();

    return periodosOrdenados.map((periodo) => ({
      etiqueta: periodo,
      valores: this.series().map((s) => ({
        cantidad: s.datos.find((d) => d.periodo === periodo)?.cantidad ?? 0,
        color: s.color,
        nombre: s.nombre,
      })),
    }));
  });

  readonly maximo = computed(() => {
    const todos = this.columnas().flatMap((c) => c.valores.map((v) => v.cantidad));
    return Math.max(1, ...todos);
  });

  alturaPorcentual(cantidad: number): number {
    return Math.max(4, Math.round((cantidad / this.maximo()) * 100));
  }
}