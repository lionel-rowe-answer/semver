toastr.options.timeOut = 3000;

localStorage.prev && $("#prev").val(localStorage.prev);
localStorage.bump && $("#bump").val(localStorage.bump);
localStorage.type && $("#type").val(localStorage.type);
localStorage.initials && $("#initials").val(localStorage.initials);

$("#output").on("click", e => {
  const input = document.createElement("input");

  document.body.appendChild(input);
  $(input)
    .val(
      $(e.currentTarget)
        .text()
        .trim()
    )[0]
    .select();

  document.execCommand("copy");

  input.remove();

  toastr.info("Copied to clipboard");
});

const formToOutput = form => {
  const { prev, bump, type, initials } = Object.fromEntries(new FormData(form));

  localStorage.prev = prev;
  localStorage.bump = bump;
  localStorage.type = type;
  localStorage.initials = initials;

  const re = /^v?(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  const m = prev.match(re);

  if (!m) return $("#output").text("Invalid previous version");

  const ts = new Date()
    .toISOString()
    .split(".")[0]
    .replace(/\D/g, "");

  const sanitizedInitials = initials.replace(/[^a-z]/gi, '')

  if (sanitizedInitials.length < 2)
    return $("#output").text("Invalid initials");

  const meta = `+${ts}-${sanitizedInitials.toLowerCase()}`;

  const { major, minor, patch /*, prerelease, buildmetadata*/ } = m.groups;

  const next = [major, minor, patch]
    .map((el, idx) => {
      if (+bump === idx) {
        return +el + 1;
      } else if (+bump < idx) {
        return 0;
      } else {
        return +el;
      }
    })
    .map(String)
    .join(".");

  let out = next + type;

  if (["-draft", "-alpha"].includes(type)) out += meta;

  $("#output").text(out);
};

$("#form").on("input", e => {
  e.preventDefault();

  formToOutput(e.currentTarget);
});

formToOutput($("#form")[0]);

setInterval(() => formToOutput($("#form")[0]), 1000);
