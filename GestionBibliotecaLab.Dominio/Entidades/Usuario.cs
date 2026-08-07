using System;
using System.Collections.Generic;

namespace GestionBibliotecaLab.Dominio.Entidades;

public partial class Usuario
{
    public int Id { get; set; }

    public string Nombres { get; set; } = null!;

    public string Apellidos { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public int RolId { get; set; }

    public DateTime FechaCreacion { get; set; }

    public DateTime? FechaActualizacion { get; set; }

    public bool IsDeleted { get; set; }

    public virtual ICollection<Penalizacion> Penalizaciones { get; set; } = new List<Penalizacion>();

    public virtual ICollection<Prestamo> Prestamos { get; set; } = new List<Prestamo>();

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public virtual ICollection<ReservaLab> ReservasLabs { get; set; } = new List<ReservaLab>();

    public virtual Rol Rol { get; set; } = null!;
}
