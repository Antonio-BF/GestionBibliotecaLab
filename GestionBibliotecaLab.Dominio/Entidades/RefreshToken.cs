using System;
using System.Collections.Generic;

namespace GestionBibliotecaLab.Dominio.Entidades;

public partial class RefreshToken
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    public string Token { get; set; } = null!;

    public DateTime FechaExpiracion { get; set; }

    public bool Revocado { get; set; }

    public DateTime? FechaRevocacion { get; set; }

    public string? ReemplazadoPorToken { get; set; }

    public DateTime FechaCreacion { get; set; }

    public virtual Usuario Usuario { get; set; } = null!;
}
