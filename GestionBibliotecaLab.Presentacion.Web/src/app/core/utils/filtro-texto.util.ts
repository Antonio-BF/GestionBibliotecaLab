import { Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs";

export function crearTextoFiltrado(control: FormControl<string>, debounceMs = 250): Signal<string> {
    return toSignal(control.valueChanges.pipe(debounceTime(debounceMs)), {
        initialValue: control.value,
    });
}