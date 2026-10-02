// Static rule tables for the local pre-encryption assessment. Data only, no logic.
export const RISKY_EXTENSIONS = {
  exe: ['executable', 'Windows executable'], dll: ['executable', 'Windows dynamic-link library'],
  scr: ['executable', 'Windows screen saver (executable)'], msi: ['executable', 'Windows installer package'],
  com: ['executable', 'DOS/Windows executable'], pif: ['executable', 'Program information file (executable)'],
  cpl: ['executable', 'Control Panel applet (executable)'], jar: ['executable', 'Java archive (can run code)'],
  apk: ['executable', 'Android application package'], hta: ['executable', 'HTML Application'],
  bat: ['script', 'Windows batch script'], cmd: ['script', 'Windows command script'],
  ps1: ['script', 'PowerShell script'], vbs: ['script', 'VBScript'], vbe: ['script', 'Encoded VBScript'],
  js: ['script', 'JavaScript/JScript'], jse: ['script', 'Encoded JScript'], wsf: ['script', 'Windows Script Host file'],
  wsh: ['script', 'Windows Script Host settings'], sh: ['script', 'Shell script'], py: ['script', 'Python script'],
  reg: ['script', 'Windows registry script'], lnk: ['script', 'Windows shortcut'],
};

// offset + bytes identify a format; `exts` are the extensions legitimately using it.
export const SIGNATURES = [
  { id: 'pe', label: 'Windows PE executable (MZ header)', kind: 'executable', offset: 0, bytes: [0x4d, 0x5a] },
  { id: 'elf', label: 'Linux ELF executable', kind: 'executable', offset: 0, bytes: [0x7f, 0x45, 0x4c, 0x46] },
  { id: 'macho32', label: 'Mach-O executable', kind: 'executable', offset: 0, bytes: [0xfe, 0xed, 0xfa, 0xce] },
  { id: 'macho64', label: 'Mach-O executable', kind: 'executable', offset: 0, bytes: [0xfe, 0xed, 0xfa, 0xcf] },
  { id: 'macho32r', label: 'Mach-O executable', kind: 'executable', offset: 0, bytes: [0xce, 0xfa, 0xed, 0xfe] },
  { id: 'macho64r', label: 'Mach-O executable', kind: 'executable', offset: 0, bytes: [0xcf, 0xfa, 0xed, 0xfe] },
  { id: 'cafebabe', label: 'Java class / Mach-O universal binary', kind: 'executable', offset: 0, bytes: [0xca, 0xfe, 0xba, 0xbe] },
  { id: 'shebang', label: 'Script with interpreter line (#!)', kind: 'script', offset: 0, bytes: [0x23, 0x21] },
  { id: 'pdf', label: 'PDF document', kind: 'data', offset: 0, bytes: [0x25, 0x50, 0x44, 0x46], exts: ['pdf'] },
  { id: 'png', label: 'PNG image', kind: 'data', offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47], exts: ['png'] },
  { id: 'jpeg', label: 'JPEG image', kind: 'data', offset: 0, bytes: [0xff, 0xd8, 0xff], exts: ['jpg', 'jpeg'] },
  { id: 'gif', label: 'GIF image', kind: 'data', offset: 0, bytes: [0x47, 0x49, 0x46, 0x38], exts: ['gif'] },
  { id: 'zip', label: 'ZIP-based container (ZIP/Office/JAR/APK)', kind: 'data', offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04], exts: ['zip', 'docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp', 'epub', 'jar', 'apk'] },
  { id: 'rar', label: 'RAR archive', kind: 'data', offset: 0, bytes: [0x52, 0x61, 0x72, 0x21], exts: ['rar'] },
  { id: '7z', label: '7-Zip archive', kind: 'data', offset: 0, bytes: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c], exts: ['7z'] },
  { id: 'gzip', label: 'GZIP archive', kind: 'data', offset: 0, bytes: [0x1f, 0x8b], exts: ['gz', 'tgz'] },
  { id: 'mp4', label: 'MP4/QuickTime media', kind: 'data', offset: 4, bytes: [0x66, 0x74, 0x79, 0x70], exts: ['mp4', 'm4a', 'm4v', 'mov', '3gp'] },
];
// Extensions whose content MUST start with a known signature (avoids noisy false positives).
export const STRICT_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'zip', 'docx', 'xlsx', 'pptx', 'rar', '7z', 'gz'];
export const EXTENSION_MIMES = {
  pdf: ['application/pdf'], png: ['image/png'], jpg: ['image/jpeg'], jpeg: ['image/jpeg'], gif: ['image/gif'],
  txt: ['text/'], zip: ['application/zip', 'application/x-zip-compressed', 'application/x-zip', 'application/octet-stream'],
};
export const EXECUTABLE_MIMES = ['application/x-msdownload', 'application/x-dosexec', 'application/x-msdos-program',
  'application/vnd.microsoft.portable-executable', 'application/x-executable', 'application/x-sh', 'application/x-bat'];
export const DECOY_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt', 'rtf', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'mp3', 'mp4'];
