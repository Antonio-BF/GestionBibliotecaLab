using System;
using System.Collections.Generic;

namespace GestionBibliotecaLab.Dominio.Entidades;

public partial class Prestamo
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    public int LibroId { get; set; }

    public DateTime FechaPrestamo { get; set; }

    public DateTime FechaDevolucionEsperada { get; set; }

    public DateTime? FechaDevolucionReal { get; set; }

    public string Estado { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public DateTime? FechaActualizacion { get; set; }

    public bool IsDeleted { get; set; }

    public virtual Libro Libro { get; set; } = null!;

    public virtual ICollection<Penalizacion> Penalizaciones { get; set; } = new List<Penalizacion>();

    public virtual Usuario Usuario { get; set; } = null!;
}
