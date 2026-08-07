using System;
using System.Collections.Generic;

namespace GestionBibliotecaLab.Dominio.Entidades;

public partial class Penalizacion
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    public int? PrestamoId { get; set; }

    public int? ReservaLabId { get; set; }

    public string Tipo { get; set; } = null!;

    public string Motivo { get; set; } = null!;

    public decimal? Monto { get; set; }

    public DateTime FechaGeneracion { get; set; }

    public DateTime? FechaResolucion { get; set; }

    public string Estado { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public DateTime? FechaActualizacion { get; set; }

    public bool IsDeleted { get; set; }

    public virtual Prestamo? Prestamo { get; set; }

    public virtual ReservaLab? ReservaLab { get; set; }

    public virtual Usuario Usuario { get; set; } = null!;
}
