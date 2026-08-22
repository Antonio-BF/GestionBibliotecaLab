using GestionBibliotecaLab.Dominio.Enums;
using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Penalizacion
{
    public class CreatePenalizacionRequest
    {
        [Required(ErrorMessage = "El origen es requerido")]
        [EnumDataType(typeof(OrigenPenalizacion), ErrorMessage = "El origen enviado no es válido.")]
        public OrigenPenalizacion Origen { get; set; }

        [Required(ErrorMessage = "El id de origen (PrestamoId o ReservaLabId según 'Origen') es requerido")]
        public int OrigenId { get; set; }

        [Required(ErrorMessage = "El tipo es requerido")]
        [EnumDataType(typeof(TipoPenalizacion), ErrorMessage = "El tipo enviado no es válido.")]
        public TipoPenalizacion Tipo { get; set; }

        [Required(ErrorMessage = "El motivo es requerido")]
        [MaxLength(300)]
        public string Motivo { get; set; } = null!;

        [Range(0, 100000, ErrorMessage = "El monto debe ser mayor o igual a 0")]
        public decimal? Monto { get; set; }
    }
}
