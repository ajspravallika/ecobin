export const WORKERS = [
  { id: 'WRK-01', name: 'Ramesh Babu', villages: ['kothapeta', 'ravulapalem'], phone: '9876500011' },
  { id: 'WRK-02', name: 'Suresh Kumar', villages: ['mandapeta'], phone: '9876500012' },
  { id: 'WRK-03', name: 'Lakshmi Prasanna', villages: ['devarapalli'], phone: '9876500013' },
  { id: 'WRK-04', name: 'Venkata Rao', villages: ['anaparthi'], phone: '9876500014' },
  { id: 'WRK-05', name: 'Anil Kumar', villages: ['kothapeta', 'mandapeta'], phone: '9876500015' },
]

export const getWorkerById = (id) => WORKERS.find((w) => w.id === id)
