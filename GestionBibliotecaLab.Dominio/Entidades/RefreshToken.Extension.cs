using System;
using System.Collections.Generic;
using System.Text;

namespace GestionBibliotecaLab.Dominio.Entidades
{
	public partial class RefreshToken
	{
		public bool EstaActivo => !Revocado && DateTime.UtcNow < FechaExpiracion;
	}
}
