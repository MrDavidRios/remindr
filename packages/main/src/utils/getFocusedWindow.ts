import koffi from 'koffi';

const PROCESS_QUERY_INFORMATION = 0x0400;
const PROCESS_VM_READ = 0x0010;
const MAX_PATH = 260;

const kernel32 = koffi.load('kernel32.dll');
const psapi = koffi.load('psapi.dll');
const user32 = koffi.load('user32.dll');

const DWORD = koffi.alias('DWORD', 'uint32_t');
const HANDLE = koffi.pointer('HANDLE', koffi.opaque());
const HWND = koffi.alias('HWND', HANDLE);

// winuser.h functions
const GetForegroundWindow = user32.func('HWND __stdcall GetForegroundWindow()');
const GetWindowThreadProcessId = user32.func(
  'DWORD __stdcall GetWindowThreadProcessId(HWND hWnd, _Out_ DWORD *lpdwProcessId)',
);

// kernel32.h functions
const OpenProcess = kernel32.func(
  'HANDLE __stdcall OpenProcess(DWORD dwDesiredAccess, bool bInheritHandle, DWORD dwProcessId)',
);
const CloseHandle = kernel32.func('bool __stdcall CloseHandle(HANDLE hObject)');

// Processes/Threads API Functions
const GetModuleFileNameExA = psapi.func(
  'DWORD __stdcall GetModuleFileNameExA(HANDLE hProcess, HANDLE hModule, char *lpFilename, DWORD nSize)',
);

export function getFocusedWindowProcessPath() {
  const foregroundWindowHandle = GetForegroundWindow();

  let ptr = [null];
  let tid = GetWindowThreadProcessId(foregroundWindowHandle, ptr);

  if (!tid) {
    // Maybe the process ended in-between?
    throw new Error(`Unable to get thread ID for window handle ${foregroundWindowHandle}`);
  }

  const pid = ptr[0];

  const processHandle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid);
  if (processHandle == null) {
    throw new Error(`Unable to open process with PID ${pid}`);
  }

  const processPathBuffer = Buffer.alloc(MAX_PATH);
  const result = GetModuleFileNameExA(processHandle, null, processPathBuffer, MAX_PATH);

  CloseHandle(processHandle);

  if (result === 0) {
    throw new Error(`Unable to get process name for PID ${pid}`);
  }

  return processPathBuffer.toString('utf-8').replace(/\0/g, '');
}
