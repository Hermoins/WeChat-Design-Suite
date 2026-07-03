import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type TimeType = "now" | "soon" | "scheduled";
export type UserRole = "driver" | "passenger";

export interface Trip {
  id: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  driverCar: string;
  route: { from: string; to: string };
  timeType: TimeType;
  scheduledTime: string | null;
  totalSeats: number;
  remainingSeats: number;
  status: "active" | "full" | "completed";
  price: string;
  createdAt: number;
  isMyTrip?: boolean;
}

export interface Passenger {
  id: string;
  name: string;
  phone: string;
  pickupPoint: string;
  dropoffPoint: string;
  status: "boarded" | "waiting" | "confirmed";
}

export interface ReviewRequest {
  tripId: string;
  passenger: {
    id: string;
    name: string;
    phone: string;
    pickupPoint: string;
    dropoffPoint: string;
  };
}

export interface MyBooking {
  tripId: string;
  trip: Trip;
  pickupPoint: string;
  dropoffPoint: string;
  status: "waiting" | "confirmed" | "rejected";
  bookedAt: number;
}

export interface SavedRoute {
  from: string;
  to: string;
}

export interface AcceptedByDriver {
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  driverCar: string;
  tripId: string;
  acceptedAt: number;
}

export interface PassengerRequest {
  id: string;
  route: { from: string; to: string };
  timeType: TimeType;
  scheduledTime: string | null;
  passengerCount: number;
  note: string;
  createdAt: number;
  acceptedBy?: AcceptedByDriver;
}

const INITIAL_PASSENGER_REQUESTS: PassengerRequest[] = [
  {
    id: "pr1",
    route: { from: "新城子", to: "道义商圈" },
    timeType: "now",
    scheduledTime: null,
    passengerCount: 1,
    note: "千禧家园南门上车，辽大北门下",
    createdAt: Date.now() - 2 * 60000,
  },
  {
    id: "pr2",
    route: { from: "新城子", to: "道义商圈" },
    timeType: "scheduled",
    scheduledTime: "明早 07:30",
    passengerCount: 2,
    note: "正良大街口，2人同行",
    createdAt: Date.now() - 8 * 60000,
  },
  {
    id: "pr3",
    route: { from: "道义商圈", to: "新城子" },
    timeType: "now",
    scheduledTime: null,
    passengerCount: 1,
    note: "道义万达广场B门",
    createdAt: Date.now() - 5 * 60000,
  },
  {
    id: "pr4",
    route: { from: "新城子", to: "道义商圈" },
    timeType: "soon",
    scheduledTime: null,
    passengerCount: 1,
    note: "",
    createdAt: Date.now() - 15 * 60000,
  },
  {
    id: "pr5",
    route: { from: "道义商圈", to: "新城子" },
    timeType: "scheduled",
    scheduledTime: "今晚 18:30",
    passengerCount: 3,
    note: "沈阳工业大学南门附近，下班顺路",
    createdAt: Date.now() - 20 * 60000,
  },
];

const INITIAL_TRIPS: Trip[] = [
  {
    id: "t1",
    driverName: "王师傅",
    driverPhone: "13812348888",
    driverPlate: "辽A·12345",
    driverCar: "白色别克GL8",
    route: { from: "新城子", to: "道义商圈" },
    timeType: "now",
    scheduledTime: null,
    totalSeats: 4,
    remainingSeats: 2,
    status: "active",
    price: "10元",
    createdAt: Date.now() - 60000,
  },
  {
    id: "t2",
    driverName: "张师傅",
    driverPhone: "13912349999",
    driverPlate: "辽A·67890",
    driverCar: "黑色大众速腾",
    route: { from: "新城子", to: "道义商圈" },
    timeType: "scheduled",
    scheduledTime: "明早 07:30",
    totalSeats: 3,
    remainingSeats: 3,
    status: "active",
    price: "10元",
    createdAt: Date.now() - 300000,
  },
  {
    id: "t3",
    driverName: "刘师傅",
    driverPhone: "13612346666",
    driverPlate: "辽A·11111",
    driverCar: "银色丰田凯美瑞",
    route: { from: "道义商圈", to: "新城子" },
    timeType: "soon",
    scheduledTime: null,
    totalSeats: 4,
    remainingSeats: 1,
    status: "active",
    price: "10元",
    createdAt: Date.now() - 120000,
  },
  {
    id: "t4",
    driverName: "陈师傅",
    driverPhone: "13712347777",
    driverPlate: "辽A·22222",
    driverCar: "红色本田雅阁",
    route: { from: "新城子", to: "道义商圈" },
    timeType: "scheduled",
    scheduledTime: "明早 08:00",
    totalSeats: 3,
    remainingSeats: 0,
    status: "full",
    price: "10元",
    createdAt: Date.now() - 600000,
  },
];

interface AppContextType {
  trips: Trip[];
  myBookings: MyBooking[];
  myTrips: Trip[];
  passengerRequests: PassengerRequest[];
  myPassengerRequests: PassengerRequest[];
  reviewRequest: ReviewRequest | null;
  isDriverMode: boolean;
  driverPassengers: Passenger[];
  historyAddresses: string[];
  savedRoutes: SavedRoute[];
  routeFilter: "all" | "to-daoyuan" | "to-xinchengzi";
  userRole: UserRole | null;
  roleLoaded: boolean;
  setRouteFilter: (f: "all" | "to-daoyuan" | "to-xinchengzi") => void;
  setUserRole: (role: UserRole) => void;
  publishTrip: (trip: Omit<Trip, "id" | "createdAt" | "isMyTrip" | "status">) => Trip;
  publishPassengerRequest: (req: Omit<PassengerRequest, "id" | "createdAt">) => PassengerRequest;
  acceptPassengerRequest: (requestId: string, driverInfo: Omit<AcceptedByDriver, "acceptedAt">) => void;
  bookSeat: (tripId: string, pickupPoint: string, dropoffPoint: string) => void;
  approvePassenger: (requestId: string) => void;
  rejectPassenger: (requestId: string, reason: string) => void;
  dismissReview: () => void;
  confirmBoarded: (passengerId: string) => void;
  removePassenger: (passengerId: string) => void;
  updateSeatCount: (delta: number) => void;
  addHistoryAddress: (addr: string) => void;
  addSavedRoute: (route: SavedRoute) => void;
  removeSavedRoute: (index: number) => void;
  simulatePassengerRequest: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [myBookings, setMyBookings] = useState<MyBooking[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [passengerRequests, setPassengerRequests] = useState<PassengerRequest[]>(INITIAL_PASSENGER_REQUESTS);
  const [myPassengerRequests, setMyPassengerRequests] = useState<PassengerRequest[]>([]);
  const [reviewRequest, setReviewRequest] = useState<ReviewRequest | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [driverPassengers, setDriverPassengers] = useState<Passenger[]>([]);
  const [historyAddresses, setHistoryAddresses] = useState<string[]>([
    "千禧家园南门",
    "正良大街口",
    "辽大北门",
    "道义万达广场",
  ]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([
    { from: "新城子", to: "道义商圈" },
    { from: "道义商圈", to: "新城子" },
  ]);
  const [routeFilter, setRouteFilter] = useState<"all" | "to-daoyuan" | "to-xinchengzi">("all");

  const isDriverMode = userRole === "driver";

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("historyAddresses"),
      AsyncStorage.getItem("myTrips"),
      AsyncStorage.getItem("myBookings"),
      AsyncStorage.getItem("userRole"),
      AsyncStorage.getItem("savedRoutes"),
    ]).then(([addresses, trips, bookings, role, routes]) => {
      if (addresses) setHistoryAddresses(JSON.parse(addresses));
      if (trips) setMyTrips(JSON.parse(trips));
      if (bookings) setMyBookings(JSON.parse(bookings));
      if (role) setUserRoleState(role as UserRole);
      if (routes) setSavedRoutes(JSON.parse(routes));
      setRoleLoaded(true);
    });
  }, []);

  const setUserRole = useCallback((role: UserRole) => {
    setUserRoleState(role);
    AsyncStorage.setItem("userRole", role);
  }, []);

  const publishTrip = useCallback(
    (tripData: Omit<Trip, "id" | "createdAt" | "isMyTrip" | "status">): Trip => {
      const newTrip: Trip = {
        ...tripData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        createdAt: Date.now(),
        isMyTrip: true,
        status: "active",
      };
      setTrips((prev) => [newTrip, ...prev]);
      setMyTrips((prev) => {
        const updated = [newTrip, ...prev];
        AsyncStorage.setItem("myTrips", JSON.stringify(updated));
        return updated;
      });
      return newTrip;
    },
    []
  );

  const bookSeat = useCallback(
    (tripId: string, pickupPoint: string, dropoffPoint: string) => {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) return;
      const booking: MyBooking = {
        tripId,
        trip,
        pickupPoint,
        dropoffPoint,
        status: "waiting",
        bookedAt: Date.now(),
      };
      setMyBookings((prev) => {
        const updated = [booking, ...prev];
        AsyncStorage.setItem("myBookings", JSON.stringify(updated));
        return updated;
      });
      addHistoryAddress(pickupPoint);
      addHistoryAddress(dropoffPoint);
    },
    [trips]
  );

  const approvePassenger = useCallback((requestId: string) => {
    setReviewRequest(null);
    const passenger: Passenger = {
      id: requestId,
      name: "乘客用户",
      phone: "13600000001",
      pickupPoint: reviewRequest?.passenger.pickupPoint ?? "",
      dropoffPoint: reviewRequest?.passenger.dropoffPoint ?? "",
      status: "waiting",
    };
    setDriverPassengers((prev) => [...prev, passenger]);
    setTrips((prev) =>
      prev.map((t) =>
        t.id === reviewRequest?.tripId
          ? { ...t, remainingSeats: Math.max(0, t.remainingSeats - 1) }
          : t
      )
    );
    setMyBookings((prev) =>
      prev.map((b) =>
        b.tripId === reviewRequest?.tripId
          ? { ...b, status: "confirmed" as const }
          : b
      )
    );
  }, [reviewRequest]);

  const rejectPassenger = useCallback((_requestId: string, _reason: string) => {
    setReviewRequest(null);
    setMyBookings((prev) =>
      prev.map((b) =>
        b.tripId === reviewRequest?.tripId && b.status === "waiting"
          ? { ...b, status: "rejected" as const }
          : b
      )
    );
  }, [reviewRequest]);

  const dismissReview = useCallback(() => {
    setReviewRequest(null);
  }, []);

  const confirmBoarded = useCallback((passengerId: string) => {
    setDriverPassengers((prev) =>
      prev.map((p) =>
        p.id === passengerId ? { ...p, status: "boarded" as const } : p
      )
    );
  }, []);

  const removePassenger = useCallback((passengerId: string) => {
    setDriverPassengers((prev) => {
      const removed = prev.find((p) => p.id === passengerId);
      if (!removed) return prev;
      setTrips((trips) =>
        trips.map((t) =>
          myTrips.some((mt) => mt.id === t.id)
            ? { ...t, remainingSeats: t.remainingSeats + 1 }
            : t
        )
      );
      return prev.filter((p) => p.id !== passengerId);
    });
  }, [myTrips]);

  const updateSeatCount = useCallback((delta: number) => {
    if (myTrips.length === 0) return;
    const activeTrip = myTrips[0];
    setTrips((prev) =>
      prev.map((t) =>
        t.id === activeTrip.id
          ? {
              ...t,
              remainingSeats: Math.max(0, Math.min(t.totalSeats, t.remainingSeats + delta)),
            }
          : t
      )
    );
    setMyTrips((prev) =>
      prev.map((t) =>
        t.id === activeTrip.id
          ? {
              ...t,
              remainingSeats: Math.max(0, Math.min(t.totalSeats, t.remainingSeats + delta)),
            }
          : t
      )
    );
  }, [myTrips]);

  const addHistoryAddress = useCallback((addr: string) => {
    if (!addr.trim()) return;
    setHistoryAddresses((prev) => {
      const filtered = prev.filter((a) => a !== addr);
      const updated = [addr, ...filtered].slice(0, 6);
      AsyncStorage.setItem("historyAddresses", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addSavedRoute = useCallback((route: SavedRoute) => {
    setSavedRoutes((prev) => {
      const filtered = prev.filter((r) => !(r.from === route.from && r.to === route.to));
      const updated = [route, ...filtered].slice(0, 3);
      AsyncStorage.setItem("savedRoutes", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSavedRoute = useCallback((index: number) => {
    setSavedRoutes((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      AsyncStorage.setItem("savedRoutes", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const publishPassengerRequest = useCallback(
    (reqData: Omit<PassengerRequest, "id" | "createdAt">): PassengerRequest => {
      const newReq: PassengerRequest = {
        ...reqData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        createdAt: Date.now(),
      };
      // Add to private "my requests" list
      setMyPassengerRequests((prev) => {
        const updated = [newReq, ...prev];
        AsyncStorage.setItem("myPassengerRequests", JSON.stringify(updated));
        return updated;
      });
      // Also add to public requests feed (visible to drivers)
      setPassengerRequests((prev) => [newReq, ...prev]);
      return newReq;
    },
    []
  );

  const acceptPassengerRequest = useCallback(
    (requestId: string, driverInfo: Omit<AcceptedByDriver, "acceptedAt">) => {
      const accepted: AcceptedByDriver = { ...driverInfo, acceptedAt: Date.now() };
      // Update public list
      setPassengerRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, acceptedBy: accepted } : r))
      );
      // Update my personal list too
      setMyPassengerRequests((prev) => {
        const updated = prev.map((r) =>
          r.id === requestId ? { ...r, acceptedBy: accepted } : r
        );
        AsyncStorage.setItem("myPassengerRequests", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const simulatePassengerRequest = useCallback(() => {
    if (myTrips.length === 0) return;
    const activeTrip = myTrips[0];
    const req: ReviewRequest = {
      tripId: activeTrip.id,
      passenger: {
        id: Date.now().toString(),
        name: "乘客用户",
        phone: "13600000001",
        pickupPoint: "千禧家园南门",
        dropoffPoint: "辽大北门",
      },
    };
    setReviewRequest(req);
  }, [myTrips]);

  return (
    <AppContext.Provider
      value={{
        trips,
        myBookings,
        myTrips,
        passengerRequests,
        myPassengerRequests,
        reviewRequest,
        isDriverMode,
        driverPassengers,
        historyAddresses,
        savedRoutes,
        routeFilter,
        userRole,
        roleLoaded,
        setRouteFilter,
        setUserRole,
        publishTrip,
        publishPassengerRequest,
        acceptPassengerRequest,
        bookSeat,
        approvePassenger,
        rejectPassenger,
        dismissReview,
        confirmBoarded,
        removePassenger,
        updateSeatCount,
        addHistoryAddress,
        addSavedRoute,
        removeSavedRoute,
        simulatePassengerRequest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
