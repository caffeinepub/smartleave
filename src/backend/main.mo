import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  type TripMode = {
    #car;
    #bike;
    #transit;
    #walk;
  };

  type Trip = {
    id : Nat;
    origin : Text;
    destination : Text;
    mode : TripMode;
    distance : Nat;
    roundTrip : Bool;
  };

  module Trip {
    public func compare(trip1 : Trip, trip2 : Trip) : Order.Order {
      Nat.compare(trip1.id, trip2.id);
    };
  };

  let trips = Map.empty<Nat, Trip>();
  var nextTripId = 0;

  func getNewTripId() : Nat {
    let tripId = nextTripId;
    nextTripId += 1;
    tripId;
  };

  public shared ({ caller }) func saveTrip(origin : Text, destination : Text, mode : TripMode, distance : Nat, roundTrip : Bool) : async Nat {
    let tripId = getNewTripId();
    let trip : Trip = {
      id = tripId;
      origin;
      destination;
      mode;
      distance;
      roundTrip;
    };
    trips.add(tripId, trip);
    tripId;
  };

  public query ({ caller }) func getTrip(tripId : Nat) : async Trip {
    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) { trip };
    };
  };

  public query ({ caller }) func getAllTrips() : async [Trip] {
    trips.values().toArray().sort();
  };

  public shared ({ caller }) func updateTrip(tripId : Nat, origin : Text, destination : Text, mode : TripMode, distance : Nat, roundTrip : Bool) : async () {
    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?existingTrip) {
        let updatedTrip : Trip = {
          id = tripId;
          origin;
          destination;
          mode;
          distance;
          roundTrip;
        };
        trips.add(tripId, updatedTrip);
      };
    };
  };

  public shared ({ caller }) func deleteTrip(tripId : Nat) : async () {
    if (not trips.containsKey(tripId)) {
      Runtime.trap("Trip not found");
    };
    trips.remove(tripId);
  };
};
