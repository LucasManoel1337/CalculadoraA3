export class util {
    static permitirSomenteNumeros(event: KeyboardEvent, limite: number) {
        const char = event.key;

        if (!/^[0-9]$/.test(char)) {
            event.preventDefault();
            return;
        }

        const input = event.target as HTMLInputElement;
        const valorAtual = input.value + char;

        if (Number(valorAtual) > limite) {
            event.preventDefault();
        }
    }

    static bloquearPasteNegativo(event: ClipboardEvent) {
        const texto = event.clipboardData?.getData('text') ?? '';

        if (!/^[0-9]+$/.test(texto)) {
            event.preventDefault();
        }
    }
}