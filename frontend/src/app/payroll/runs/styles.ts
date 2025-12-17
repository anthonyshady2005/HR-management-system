export const styles = {
  container: "p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500",
  header: {
    wrapper: "flex flex-col md:flex-row md:items-center justify-between gap-4",
    title: "text-3xl font-bold text-slate-200 tracking-tight",
    description: "text-slate-400 mt-1",
    actions: "flex items-center gap-2",
  },
  buttons: {
    export: "gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white",
    create: "bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-900/20",
    cancel: "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white",
    initiate: "bg-emerald-600 hover:bg-emerald-700 text-white",
    datePicker: "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
    icon: "h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
  },
  dialog: {
    content: "sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-200",
    header: {
      title: "text-white",
      description: "text-slate-400",
    },
    form: {
      grid: "grid gap-4 py-4",
      item: "grid gap-2",
      label: "text-slate-300",
      selectTrigger: "bg-slate-800 border-slate-700 text-white",
      selectContent: "bg-slate-800 border-slate-700 text-white z-[9999]",
      selectItem: "focus:bg-slate-700 focus:text-white",
      calendar: "bg-slate-900 text-white",
      popover: "w-auto p-0 bg-slate-900 border-slate-800",
      helperText: "text-xs text-slate-500"
    }
  },
  card: {
    root: "border-slate-800 bg-slate-900/50 shadow-sm",
    header: "border-b border-slate-800 bg-slate-900/50",
    title: "text-white",
    description: "text-slate-400",
    searchIcon: "absolute left-2.5 top-2.5 h-4 w-4 text-slate-400",
    searchInput: "pl-9 w-[250px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50",
  },
  table: {
    header: "bg-slate-900/80",
    row: "hover:bg-slate-800/50 border-slate-800",
    head: "text-slate-400",
    headRight: "text-right text-slate-400",
    loadingRow: "h-24 text-center text-slate-400",
    emptyRow: "h-64 text-center",
    emptyWrapper: "flex flex-col items-center justify-center text-slate-500",
    emptyIcon: "w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3",
    emptyText: "font-medium text-lg text-slate-400",
    emptySubtext: "text-sm max-w-sm mt-1 text-slate-500",
    cellMedium: "font-medium text-slate-300",
    cellFlex: "flex items-center gap-2 text-slate-300",
    badge: "rounded-md px-2 py-0.5 border",
    avatar: "w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400 border border-slate-700",
    specialistName: "text-sm text-slate-400",
    systemText: "text-slate-500 text-sm",
    netPay: "text-right font-mono font-medium text-emerald-500",
    issueBadge: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
    actions: {
      review: "bg-blue-600 hover:bg-blue-700 text-white h-8 px-2 text-xs",
      approve: "bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2 text-xs",
      reject: "bg-red-600 hover:bg-red-700 text-white h-8 px-2 text-xs",
      lock: "bg-slate-700 hover:bg-slate-600 text-white h-8 px-2 text-xs",
      unlock: "bg-amber-600 hover:bg-amber-700 text-white h-8 px-2 text-xs",
      wrapper: "flex items-center gap-2 justify-end"
    }
  },
  statusColors: (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "UNDER_REVIEW": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "APPROVED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "PAID": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "REJECTED": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  }
};
