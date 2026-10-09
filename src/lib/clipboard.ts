export const copyText = async (text: string, container: HTMLElement) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard api only works on https / localhost. the textarea has to sit inside the popup or focusing it closes the popup
    const input = document.createElement("textarea");
    input.value = text;
    input.className = "sr-only";
    container.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
};
