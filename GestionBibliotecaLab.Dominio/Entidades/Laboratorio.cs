using System;
using System.Collections.Generic;

namespace GestionBibliotecaLab.Dominio.Entidades;

public partial class Laboratorio
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public int Capacidad { get; set; }

    public string Ubicacion { get; set; } = null!;

    public string? Equipamiento { get; set; }

    public string? Descripcion { get; set; }

    public string? Imagen { get; set; }

    public string Estado { get; set; } = null!;

    public byte[] RowVersion { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public DateTime? FechaActualizacion { get; set; }

    public bool IsDeleted { get; set; }

    public virtual ICollection<ReservaLab> ReservasLabs { get; set; } = new List<ReservaLab>();
}
