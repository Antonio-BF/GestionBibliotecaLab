import { IconName } from "../core/constants/icons.constants";

export interface MenuItem {
  etiqueta: string;
  ruta: string;
  roles: string[];
  habilitado: boolean;
  icono : IconName;
}
