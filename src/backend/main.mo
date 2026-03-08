import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Float "mo:core/Float";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type MenuItem = {
    id : Nat;
    category : Text;
    name : Text;
    description : Text;
    price : Float;
    available : Bool;
  };

  type Reservation = {
    id : Nat;
    guestName : Text;
    date : Text;
    time : Text;
    partySize : Nat;
    phone : Text;
    status : Text;
    createdAt : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let menuItems = Map.empty<Nat, MenuItem>();
  let reservations = Map.empty<Nat, Reservation>();
  var menuItemIdCounter = 0;
  var reservationIdCounter = 0;
  var persistedHwmMenuItemId = 0;
  var persistedHwmReservationId = 0;

  module MenuItem {
    public func compareByCategory(a : MenuItem, b : MenuItem) : Order.Order {
      Text.compare(a.category, b.category);
    };
  };

  func getNextMenuItemId() : Nat {
    menuItemIdCounter += 1;
    if (menuItemIdCounter > persistedHwmMenuItemId) {
      persistedHwmMenuItemId := menuItemIdCounter;
    };
    menuItemIdCounter;
  };

  func getNextReservationId() : Nat {
    reservationIdCounter += 1;
    if (reservationIdCounter > persistedHwmReservationId) {
      persistedHwmReservationId := reservationIdCounter;
    };
    reservationIdCounter;
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Menu Item Functions
  public query ({ caller }) func listMenuItems() : async [MenuItem] {
    menuItems.values().toArray().filter(func(item) { item.available });
  };

  public query ({ caller }) func getMenuItems() : async [MenuItem] {
    menuItems.values().toArray().filter(func(item) { item.available });
  };

  public query ({ caller }) func getMenuItemsByCategory(category : Text) : async [MenuItem] {
    menuItems.values().toArray().filter(
      func(item) { item.available and Text.equal(item.category, category) }
    ).sort(MenuItem.compareByCategory);
  };

  public query ({ caller }) func getAllMenuItems() : async [MenuItem] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all menu");
    };
    menuItems.values().toArray();
  };

  public shared ({ caller }) func addMenuItem(category : Text, name : Text, description : Text, price : Float) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add new menu item");
    };
    let id = getNextMenuItemId();
    let item : MenuItem = {
      id;
      category;
      name;
      description;
      price;
      available = true;
    };
    menuItems.add(id, item);
    id;
  };

  public shared ({ caller }) func updateMenuItem(id : Nat, category : Text, name : Text, description : Text, price : Float, available : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };

    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found. ") };
      case (?_) {
        let updatedItem : MenuItem = {
          id;
          category;
          name;
          description;
          price;
          available;
        };
        menuItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete menu items");
    };
    if (not menuItems.containsKey(id)) {
      Runtime.trap("Menu item does not exist. ");
    };
    menuItems.remove(id);
  };

  // Reservation Functions
  public shared ({ caller }) func createReservation(guestName : Text, date : Text, time : Text, partySize : Nat, phone : Text) : async Nat {
    let id = getNextReservationId();

    let reservation : Reservation = {
      id;
      guestName;
      date;
      time;
      partySize;
      phone;
      status = "pending";
      createdAt = Time.now();
    };

    reservations.add(id, reservation);
    id;
  };

  public query ({ caller }) func getReservations() : async {
    reservations : [Reservation];
    completed : [Reservation];
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view reservations");
    };

    let allReservations = reservations.values().toArray();
    let activeReservations = allReservations.filter(
      func(r : Reservation) : Bool {
        not Text.equal(r.status, "cancelled")
      }
    );
    let completedReservations = allReservations.filter(
      func(r : Reservation) : Bool {
        Text.equal(r.status, "cancelled")
      }
    );

    {
      reservations = activeReservations;
      completed = completedReservations;
    };
  };

  public shared ({ caller }) func updateReservationStatus(reservationId : Nat, newStatus : Text) : async (Text, Int) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update reservation status");
    };

    switch (reservations.get(reservationId)) {
      case (null) { Runtime.trap("Reservation does not exist. ") };
      case (?existingReservation) {
        let updatedReservation : Reservation = {
          id = existingReservation.id;
          guestName = existingReservation.guestName;
          date = existingReservation.date;
          time = existingReservation.time;
          partySize = existingReservation.partySize;
          phone = existingReservation.phone;
          status = newStatus;
          createdAt = existingReservation.createdAt;
        };
        reservations.add(reservationId, updatedReservation);
        (newStatus, Time.now());
      };
    };
  };

  // Seed Data
  let defaultMenuItems : [MenuItem] = [
    {
      id = 0 : Nat;
      category = "Appetizers";
      name = "Bruschetta";
      description = "Toasted bread with tomatoes";
      price = 6.99;
      available = true;
    },
    {
      id = 0 : Nat;
      category = "Main Course";
      name = "Grilled Salmon";
      description = "Salmon fillet with veggies";
      price = 15.49;
      available = true;
    },
    {
      id = 0 : Nat;
      category = "Desserts";
      name = "Chocolate Lava Cake";
      description = "Warm chocolate cake with molten center";
      price = 7.99;
      available = true;
    },
    {
      id = 0 : Nat;
      category = "Drinks";
      name = "Fresh Lemonade";
      description = "Freshly squeezed lemons";
      price = 3.49;
      available = true;
    },
    {
      id = 0 : Nat;
      category = "Appetizers";
      name = "Mozzarella Sticks";
      description = "Fried cheese sticks";
      price = 5.99;
      available = true;
    },
    {
      id = 0 : Nat;
      category = "Main Course";
      name = "Chicken Alfredo";
      description = "Chicken with creamy Alfredo sauce";
      price = 13.99;
      available = true;
    },
    {
      id = 0 : Nat;
      category = "Desserts";
      name = "Cheesecake";
      description = "Classic New York style";
      price = 6.49;
      available = true;
    },
    {
      id = 0 : Nat;
      category = "Drinks";
      name = "Iced Tea";
      description = "Brewed black tea with ice";
      price = 2.99;
      available = true;
    },
  ];

  public shared ({ caller }) func seedMenuItems() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can seed menu items");
    };

    let items = defaultMenuItems.map(
      func(item) {
        {
          id = getNextMenuItemId() : Nat;
          category = item.category;
          name = item.name;
          description = item.description;
          price = item.price;
          available = item.available;
        };
      }
    );

    items.forEach(func(item) { menuItems.add(item.id, item) });
  };
};
