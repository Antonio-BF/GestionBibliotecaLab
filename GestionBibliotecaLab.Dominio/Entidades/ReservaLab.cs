using System;
using System.Collections.Generic;

namespace GestionBibliotecaLab.Dominio.Entidades;

public partial class ReservaLab
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    public int LaboratorioId { get; set; }

    public DateOnly Fecha { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFin { get; set; }

    public string Estado { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public DateTime? FechaActualizacion { get; set; }

    public bool IsDeleted { get; set; }

    public virtual Laboratorio Laboratorio { get; set; } = null!;

    public virtual ICollection<Penalizacion> Penalizaciones { get; set; } = new List<Penalizacion>();

    public virtual Usuario Usuario { get; set; } = null!;
}
