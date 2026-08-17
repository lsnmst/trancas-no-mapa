export function normalizeCidade(estado, cidade) {
    if (!cidade) return cidade;

    const cidadeNormalizada = cidade.trim();

    if (
        estado === "DF" &&
        cidadeNormalizada.toLowerCase() === "brasilia"
    ) {
        return "Distrito Federal";
    }

    return cidadeNormalizada;
}