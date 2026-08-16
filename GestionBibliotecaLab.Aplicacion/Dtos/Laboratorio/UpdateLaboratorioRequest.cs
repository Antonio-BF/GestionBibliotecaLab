using GestionBibliotecaLab.Dominio.Enums;
using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Laboratorio
{
    public class UpdateLaboratorioRequest
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100, ErrorMessage = "El campo solo acepta 100 caracteres")]
        public string Nombre { get; set; } = null!;

        [Required(ErrorMessage = "La capacidad es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La capacidad debe ser mayor a 0")]
        public int Capacidad { get; set; }

        [MaxLength(500, ErrorMessage = "El campo solo acepta 500 caracteres")]
        public string? Equipamiento { get; set; }

        [MaxLength(1000)]
        public string? Descripcion { get; set; }

        [Required(ErrorMessage = "La ubicación es requerida")]
        [MaxLength(150, ErrorMessage = "El campo solo acepta 150 caracteres")]
        public string Ubicacion { get; set; } = null!;

        [Required(ErrorMessage = "El estado es requerido")]
        [EnumDataType(typeof(EstadoLaboratorio), ErrorMessage = "El estado enviado no es válido.")]
        public EstadoLaboratorio Estado { get; set; }

        [Required(ErrorMessage = "El RowVersion es requerido para controlar concurrencia")]
        public string RowVersion { get; set; } = null!;
    }
}
