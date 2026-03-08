import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Loader2,
  LogIn,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { MenuItem, Reservation } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddMenuItem,
  useDeleteMenuItem,
  useGetAllMenuItems,
  useGetReservations,
  useIsCallerAdmin,
  useSeedMenuItems,
  useUpdateMenuItem,
  useUpdateReservationStatus,
} from "../hooks/useQueries";

const CATEGORIES = ["appetizers", "main", "desserts", "drinks"];

type MenuFormData = {
  category: string;
  name: string;
  description: string;
  price: string;
  available: boolean;
};

const emptyForm = (): MenuFormData => ({
  category: "appetizers",
  name: "",
  description: "",
  price: "",
  available: true,
});

// ─── Admin Guard ─────────────────────────────────────────────────────────────

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: isAdmin, isLoading, isError } = useIsCallerAdmin();
  const { identity, login, loginStatus } = useInternetIdentity();

  if (isLoading) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="font-ui text-muted-foreground">
            Checking permissions...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="admin.error_state"
        className="min-h-screen flex items-center justify-center px-4"
      >
        <div className="text-center max-w-sm">
          <p className="font-display text-2xl text-foreground mb-2">Error</p>
          <p className="font-ui text-muted-foreground">
            Unable to verify admin status. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-3">
            Admin Access Required
          </h2>
          <p className="font-ui text-muted-foreground mb-8">
            Please sign in to access the admin dashboard.
          </p>
          <Button
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            className="font-ui font-semibold bg-primary text-primary-foreground px-8"
          >
            {loginStatus === "logging-in" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-3">
            Access Denied
          </h2>
          <p className="font-ui text-muted-foreground">
            You don&apos;t have admin privileges. Contact the restaurant owner.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ─── Menu Management Tab ──────────────────────────────────────────────────────

function MenuManagement() {
  const { data: items = [], isLoading } = useGetAllMenuItems();
  const { mutateAsync: addItem } = useAddMenuItem();
  const { mutateAsync: updateItem } = useUpdateMenuItem();
  const { mutateAsync: deleteItem } = useDeleteMenuItem();
  const { mutateAsync: seedItems, isPending: isSeeding } = useSeedMenuItems();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [formData, setFormData] = useState<MenuFormData>(emptyForm());
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingItem(null);
    setFormData(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      name: item.name,
      description: item.description,
      price: String(item.price),
      available: item.available,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const price = Number.parseFloat(formData.price);
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      Number.isNaN(price)
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateItem({
          id: editingItem.id,
          category: formData.category,
          name: formData.name,
          description: formData.description,
          price,
          available: formData.available,
        });
        toast.success("Menu item updated");
      } else {
        await addItem({
          category: formData.category,
          name: formData.name,
          description: formData.description,
          price,
        });
        toast.success("Menu item added");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error("Failed to save item");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await deleteItem(deleteTarget);
      toast.success("Item removed from menu");
    } catch (err) {
      toast.error("Failed to delete item");
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSeed = async () => {
    try {
      await seedItems();
      toast.success("Menu seeded with sample items");
    } catch {
      toast.error("Failed to seed menu");
    }
  };

  if (isLoading) {
    return (
      <div data-ocid="admin.loading_state" className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => `menu-sk-${i}`).map((k) => (
          <Skeleton key={k} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="font-ui text-sm text-muted-foreground">
          {items.length} item{items.length !== 1 ? "s" : ""} total
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            disabled={isSeeding}
            className="font-ui border-border text-muted-foreground hover:text-foreground"
          >
            {isSeeding ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            Seed Sample Items
          </Button>
          <Button
            data-ocid="admin.add_item_button"
            onClick={openAdd}
            size="sm"
            className="font-ui bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div
          data-ocid="admin.menu.empty_state"
          className="text-center py-16 border border-dashed border-border rounded-xl"
        >
          <p className="font-display text-xl text-muted-foreground/60 mb-2">
            No menu items yet
          </p>
          <p className="font-ui text-sm text-muted-foreground mb-4">
            Add items manually or seed sample data
          </p>
          <Button onClick={openAdd} size="sm" className="font-ui">
            <Plus className="mr-2 h-4 w-4" />
            Add First Item
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[480px] rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-ui text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="font-ui text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="font-ui text-muted-foreground hidden md:table-cell">
                  Price
                </TableHead>
                <TableHead className="font-ui text-muted-foreground hidden lg:table-cell">
                  Status
                </TableHead>
                <TableHead className="font-ui text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow
                  key={String(item.id)}
                  data-ocid={`admin.menu.item.${i + 1}`}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell>
                    <div>
                      <p className="font-ui font-medium text-foreground text-sm">
                        {item.name}
                      </p>
                      <p className="font-ui text-xs text-muted-foreground hidden sm:block line-clamp-1 max-w-xs">
                        {item.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="font-ui text-xs capitalize"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-ui text-foreground font-medium">
                    ₹{item.price.toFixed(0)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant={item.available ? "default" : "secondary"}
                      className={`font-ui text-xs ${item.available ? "bg-primary/20 text-primary border-primary/30" : ""}`}
                    >
                      {item.available ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        data-ocid={`admin.edit_button.${i + 1}`}
                        onClick={() => openEdit(item)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-ocid={`admin.delete_button.${i + 1}`}
                        onClick={() => setDeleteTarget(item.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          data-ocid="admin.dialog"
          className="bg-card border-border max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
            <DialogDescription className="font-ui text-muted-foreground">
              {editingItem
                ? "Update the details of this menu item."
                : "Add a new dish to the menu."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="font-ui text-sm text-foreground">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, category: v }))
                }
              >
                <SelectTrigger className="font-ui bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem
                      key={c}
                      value={c}
                      className="font-ui capitalize"
                    >
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="item-name"
                className="font-ui text-sm text-foreground"
              >
                Name *
              </Label>
              <Input
                id="item-name"
                placeholder="e.g. Butter Chicken"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                className="font-ui bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="item-desc"
                className="font-ui text-sm text-foreground"
              >
                Description *
              </Label>
              <Input
                id="item-desc"
                placeholder="Brief description of the dish"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                className="font-ui bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="item-price"
                className="font-ui text-sm text-foreground"
              >
                Price (₹) *
              </Label>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="10"
                placeholder="350"
                value={formData.price}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, price: e.target.value }))
                }
                className="font-ui bg-background border-border"
              />
            </div>

            {editingItem && (
              <div className="flex items-center gap-3">
                <Switch
                  id="item-available"
                  checked={formData.available}
                  onCheckedChange={(v) =>
                    setFormData((p) => ({ ...p, available: v }))
                  }
                />
                <Label
                  htmlFor="item-available"
                  className="font-ui text-sm text-foreground cursor-pointer"
                >
                  Available on menu
                </Label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="admin.cancel_button"
              onClick={() => setModalOpen(false)}
              className="font-ui border-border text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.save_button"
              onClick={handleSave}
              disabled={saving}
              className="font-ui bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Remove Menu Item?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-ui text-muted-foreground">
              This action cannot be undone. The item will be permanently removed
              from the menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.cancel_button"
              className="font-ui border-border text-muted-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.confirm_button.1"
              onClick={handleDelete}
              className="font-ui bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Reservations Tab ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  completed: "bg-muted text-muted-foreground",
};

function ReservationRow({
  reservation,
  index,
  onConfirm,
  onCancel,
  isUpdating,
}: {
  reservation: Reservation;
  index: number;
  onConfirm: (id: bigint) => void;
  onCancel: (id: bigint) => void;
  isUpdating: boolean;
}) {
  const statusClass =
    STATUS_COLORS[reservation.status] || STATUS_COLORS.pending;
  const canAct = reservation.status === "pending";

  return (
    <TableRow
      data-ocid={`admin.reservation.item.${index + 1}`}
      className="border-border hover:bg-muted/50"
    >
      <TableCell>
        <div>
          <p className="font-ui font-medium text-foreground text-sm">
            {reservation.guestName}
          </p>
          <p className="font-ui text-xs text-muted-foreground">
            {reservation.phone}
          </p>
        </div>
      </TableCell>
      <TableCell className="font-ui text-sm text-foreground">
        {reservation.date}
      </TableCell>
      <TableCell className="font-ui text-sm text-foreground hidden sm:table-cell">
        {reservation.time}
      </TableCell>
      <TableCell className="font-ui text-sm text-foreground hidden md:table-cell">
        {String(reservation.partySize)}
      </TableCell>
      <TableCell>
        <Badge className={`font-ui text-xs border capitalize ${statusClass}`}>
          {reservation.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {canAct && (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              data-ocid={`admin.confirm_button.${index + 1}`}
              onClick={() => onConfirm(reservation.id)}
              disabled={isUpdating}
              className="h-8 w-8 text-muted-foreground hover:text-green-400"
              title="Confirm reservation"
            >
              <Check className="h-3.5 w-3.5" />
              <span className="sr-only">Confirm</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              data-ocid={`admin.cancel_button.${index + 1}`}
              onClick={() => onCancel(reservation.id)}
              disabled={isUpdating}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Cancel reservation"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

function ReservationsManagement() {
  const { data, isLoading, isError } = useGetReservations();
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateReservationStatus();

  const allReservations = [
    ...(data?.reservations ?? []),
    ...(data?.completed ?? []),
  ];

  const handleConfirm = async (id: bigint) => {
    try {
      await updateStatus({ reservationId: id, newStatus: "confirmed" });
      toast.success("Reservation confirmed");
    } catch {
      toast.error("Failed to confirm reservation");
    }
  };

  const handleCancel = async (id: bigint) => {
    try {
      await updateStatus({ reservationId: id, newStatus: "cancelled" });
      toast.success("Reservation cancelled");
    } catch {
      toast.error("Failed to cancel reservation");
    }
  };

  if (isLoading) {
    return (
      <div data-ocid="admin.loading_state" className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => `res-sk-${i}`).map((k) => (
          <Skeleton key={k} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="admin.error_state"
        className="text-center py-12 text-destructive font-ui"
      >
        Failed to load reservations. Please try again.
      </div>
    );
  }

  if (allReservations.length === 0) {
    return (
      <div
        data-ocid="admin.reservation.empty_state"
        className="text-center py-16 border border-dashed border-border rounded-xl"
      >
        <p className="font-display text-xl text-muted-foreground/60 mb-2">
          No reservations yet
        </p>
        <p className="font-ui text-sm text-muted-foreground">
          Reservations will appear here when guests book tables.
        </p>
      </div>
    );
  }

  const pending = allReservations.filter((r) => r.status === "pending");
  const confirmed = allReservations.filter((r) => r.status === "confirmed");
  const others = allReservations.filter(
    (r) => r.status !== "pending" && r.status !== "confirmed",
  );
  const sorted = [...pending, ...confirmed, ...others];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-foreground">
              {pending.length}
            </p>
            <p className="font-ui text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-foreground">
              {confirmed.length}
            </p>
            <p className="font-ui text-xs text-muted-foreground">Confirmed</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-foreground">
              {allReservations.length}
            </p>
            <p className="font-ui text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[480px] rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-ui text-muted-foreground">
                Guest
              </TableHead>
              <TableHead className="font-ui text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="font-ui text-muted-foreground hidden sm:table-cell">
                Time
              </TableHead>
              <TableHead className="font-ui text-muted-foreground hidden md:table-cell">
                Party
              </TableHead>
              <TableHead className="font-ui text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="font-ui text-muted-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r, i) => (
              <ReservationRow
                key={String(r.id)}
                reservation={r}
                index={i}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isUpdating={isUpdating}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────

function AdminDashboard() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 8)}...${principal.slice(-4)}`
    : "";

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-card border-b border-border py-10 md:py-14">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-ui text-xs text-primary tracking-widest uppercase font-semibold mb-2">
                Admin
              </p>
              <h1 className="font-display font-black text-4xl md:text-5xl text-foreground">
                Dashboard
              </h1>
              {shortPrincipal && (
                <p className="font-ui text-xs text-muted-foreground mt-2">
                  Logged in as: {shortPrincipal}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="font-ui border-border text-muted-foreground hover:text-foreground"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 md:py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="menu">
            <TabsList className="mb-8 bg-card border border-border p-1 rounded-xl">
              <TabsTrigger
                value="menu"
                data-ocid="admin.menu_tab"
                className="font-ui font-medium px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                🍽️ Menu Management
              </TabsTrigger>
              <TabsTrigger
                value="reservations"
                data-ocid="admin.reservations_tab"
                className="font-ui font-medium px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                📅 Reservations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="menu">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display font-bold text-2xl text-foreground mb-6">
                  Menu Items
                </h2>
                <MenuManagement />
              </div>
            </TabsContent>

            <TabsContent value="reservations">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display font-bold text-2xl text-foreground mb-6">
                  Reservations
                </h2>
                <ReservationsManagement />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
