import { createContext, useContext, useState } from "react";

export type Locale = "en" | "es" | "fr" | "hi" | "ar";

export interface Translations {
  appTagline: string;
  weekend: string;
  weekday: string;
  planYourTrip: string;
  origin: string;
  destination: string;
  transportMode: string;
  car: string;
  bike: string;
  walk: string;
  tripType: string;
  oneWay: string;
  roundTrip: string;
  officeHours: string;
  officeHoursOn: string;
  officeHoursOff: string;
  tripDate: string;
  findBestTimes: string;
  departure: string;
  return: string;
  checkDeparture: string;
  checkReturn: string;
  evaluate: string;
  goodOption: string;
  fairOption: string;
  notRecommended: string;
  traffic: string;
  trafficLow: string;
  trafficModerate: string;
  trafficHeavy: string;
  bestOption: string;
  bestAvailable: string;
  routeSummary: string;
  distance: string;
  transport: string;
  bestCase: string;
  worstCase: string;
  planAnother: string;
  setReminder: string;
  reminderSet: string;
  share: string;
  profile: string;
  savedPlaces: string;
  history: string;
  saveChanges: string;
  signOut: string;
  username: string;
  email: string;
  getStarted: string;
  createAccount: string;
  onboardingSubtitle: string;
  password: string;
  continueBtn: string;
  tripHistory: string;
  noHistory: string;
  reRun: string;
  rainExpected: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    appTagline: "Know Before You Go",
    weekend: "Weekend",
    weekday: "Weekday",
    planYourTrip: "Plan Your Trip",
    origin: "Origin",
    destination: "Destination",
    transportMode: "Transport Mode",
    car: "Car",
    bike: "Bike",
    walk: "Walk",
    tripType: "Trip Type",
    oneWay: "One-Way",
    roundTrip: "Round Trip",
    officeHours: "Office Hours",
    officeHoursOn: "Office Hours On",
    officeHoursOff: "Office Hours Off",
    tripDate: "Trip Date",
    findBestTimes: "Find Best Times",
    departure: "Departure",
    return: "Return",
    checkDeparture: "Check Your Departure Time",
    checkReturn: "Check Your Return Time",
    evaluate: "Evaluate",
    goodOption: "Good Option",
    fairOption: "Fair Option",
    notRecommended: "Not Recommended",
    traffic: "Traffic",
    trafficLow: "Low",
    trafficModerate: "Moderate",
    trafficHeavy: "Heavy",
    bestOption: "\u2605 Best Option",
    bestAvailable: "\u2605 Best Available Options",
    routeSummary: "Route Summary",
    distance: "Distance",
    transport: "Transport",
    bestCase: "Best Case",
    worstCase: "Worst Case",
    planAnother: "Plan Another Trip",
    setReminder: "Set Reminder",
    reminderSet: "Reminder Set",
    share: "Share Trip",
    profile: "Profile",
    savedPlaces: "Saved Places",
    history: "History",
    saveChanges: "Save Changes",
    signOut: "Sign Out",
    username: "Username",
    email: "Email",
    getStarted: "Get Started",
    createAccount: "Create your account",
    onboardingSubtitle: "Plan smarter trips with QuikLiv",
    password: "Password",
    continueBtn: "Continue",
    tripHistory: "Trip History",
    noHistory: "No trips yet. Plan your first trip!",
    reRun: "Re-run",
    rainExpected: "\ud83c\udf27 Rain expected \u2014 allow extra travel time.",
  },
  es: {
    appTagline: "Sabe Antes de Ir",
    weekend: "Fin de semana",
    weekday: "Entre semana",
    planYourTrip: "Planifica tu Viaje",
    origin: "Origen",
    destination: "Destino",
    transportMode: "Modo de Transporte",
    car: "Coche",
    bike: "Bicicleta",
    walk: "Caminar",
    tripType: "Tipo de Viaje",
    oneWay: "Solo ida",
    roundTrip: "Ida y vuelta",
    officeHours: "Horas de Oficina",
    officeHoursOn: "Horas de Oficina On",
    officeHoursOff: "Horas de Oficina Off",
    tripDate: "Fecha del Viaje",
    findBestTimes: "Encontrar Mejores Horarios",
    departure: "Salida",
    return: "Regreso",
    checkDeparture: "Verifica tu Hora de Salida",
    checkReturn: "Verifica tu Hora de Regreso",
    evaluate: "Evaluar",
    goodOption: "Buena Opci\u00f3n",
    fairOption: "Opci\u00f3n Aceptable",
    notRecommended: "No Recomendado",
    traffic: "Tr\u00e1fico",
    trafficLow: "Bajo",
    trafficModerate: "Moderado",
    trafficHeavy: "Pesado",
    bestOption: "\u2605 Mejor Opci\u00f3n",
    bestAvailable: "\u2605 Mejores Opciones Disponibles",
    routeSummary: "Resumen de Ruta",
    distance: "Distancia",
    transport: "Transporte",
    bestCase: "Mejor Caso",
    worstCase: "Peor Caso",
    planAnother: "Planificar Otro Viaje",
    setReminder: "Poner Recordatorio",
    reminderSet: "Recordatorio Activo",
    share: "Compartir Viaje",
    profile: "Perfil",
    savedPlaces: "Lugares Guardados",
    history: "Historial",
    saveChanges: "Guardar Cambios",
    signOut: "Cerrar Sesi\u00f3n",
    username: "Nombre de Usuario",
    email: "Correo Electr\u00f3nico",
    getStarted: "Comenzar",
    createAccount: "Crear tu cuenta",
    onboardingSubtitle: "Planifica viajes m\u00e1s inteligentes con QuikLiv",
    password: "Contrase\u00f1a",
    continueBtn: "Continuar",
    tripHistory: "Historial de Viajes",
    noHistory: "A\u00fan no hay viajes. \u00a1Planifica el primero!",
    reRun: "Repetir",
    rainExpected:
      "\ud83c\udf27 Se espera lluvia \u2014 agrega tiempo extra de viaje.",
  },
  fr: {
    appTagline: "Sachez Avant de Partir",
    weekend: "Week-end",
    weekday: "Semaine",
    planYourTrip: "Planifiez votre Voyage",
    origin: "Origine",
    destination: "Destination",
    transportMode: "Mode de Transport",
    car: "Voiture",
    bike: "V\u00e9lo",
    walk: "Marche",
    tripType: "Type de Voyage",
    oneWay: "Aller simple",
    roundTrip: "Aller-retour",
    officeHours: "Heures de Bureau",
    officeHoursOn: "Heures de Bureau On",
    officeHoursOff: "Heures de Bureau Off",
    tripDate: "Date du Voyage",
    findBestTimes: "Trouver les Meilleurs Horaires",
    departure: "D\u00e9part",
    return: "Retour",
    checkDeparture: "V\u00e9rifiez votre Heure de D\u00e9part",
    checkReturn: "V\u00e9rifiez votre Heure de Retour",
    evaluate: "\u00c9valuer",
    goodOption: "Bonne Option",
    fairOption: "Option Acceptable",
    notRecommended: "Pas Recommand\u00e9",
    traffic: "Trafic",
    trafficLow: "Faible",
    trafficModerate: "Mod\u00e9r\u00e9",
    trafficHeavy: "Dense",
    bestOption: "\u2605 Meilleure Option",
    bestAvailable: "\u2605 Meilleures Options Disponibles",
    routeSummary: "R\u00e9sum\u00e9 de l'Itin\u00e9raire",
    distance: "Distance",
    transport: "Transport",
    bestCase: "Meilleur Cas",
    worstCase: "Pire Cas",
    planAnother: "Planifier un Autre Voyage",
    setReminder: "D\u00e9finir un Rappel",
    reminderSet: "Rappel D\u00e9fini",
    share: "Partager le Voyage",
    profile: "Profil",
    savedPlaces: "Lieux Enregistr\u00e9s",
    history: "Historique",
    saveChanges: "Enregistrer",
    signOut: "Se D\u00e9connecter",
    username: "Nom d'Utilisateur",
    email: "Adresse E-mail",
    getStarted: "Commencer",
    createAccount: "Cr\u00e9er votre compte",
    onboardingSubtitle: "Planifiez des voyages plus intelligents avec QuikLiv",
    password: "Mot de Passe",
    continueBtn: "Continuer",
    tripHistory: "Historique des Voyages",
    noHistory: "Aucun voyage encore. Planifiez le premier!",
    reRun: "Relancer",
    rainExpected:
      "\ud83c\udf27 Pluie attendue \u2014 pr\u00e9voyez du temps suppl\u00e9mentaire.",
  },
  hi: {
    appTagline:
      "\u091c\u093e\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u091c\u093e\u0928\u0947\u0902",
    weekend: "\u0938\u092a\u094d\u0924\u093e\u0939\u093e\u0902\u0924",
    weekday: "\u0915\u093e\u0930\u094d\u092f\u0926\u093f\u0935\u0938",
    planYourTrip:
      "\u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0940 \u092f\u094b\u091c\u0928\u093e \u092c\u0928\u093e\u090f\u0902",
    origin:
      "\u092a\u094d\u0930\u0938\u094d\u0925\u093e\u0928 \u0938\u094d\u0925\u093e\u0928",
    destination: "\u0917\u0902\u0924\u0935\u094d\u092f",
    transportMode:
      "\u092a\u0930\u093f\u0935\u0939\u0928 \u0938\u093e\u0927\u0928",
    car: "\u0915\u093e\u0930",
    bike: "\u092c\u093e\u0907\u0915",
    walk: "\u092a\u0948\u0926\u0932",
    tripType:
      "\u092f\u093e\u0924\u094d\u0930\u093e \u0915\u093e \u092a\u094d\u0930\u0915\u093e\u0930",
    oneWay: "\u090f\u0915\u0924\u0930\u092b\u093e",
    roundTrip: "\u0935\u093e\u092a\u0938\u0940",
    officeHours:
      "\u0915\u093e\u0930\u094d\u092f\u093e\u0932\u092f \u0938\u092e\u092f",
    officeHoursOn:
      "\u0915\u093e\u0930\u094d\u092f\u093e\u0932\u092f \u0938\u092e\u092f \u091a\u093e\u0932\u0942",
    officeHoursOff:
      "\u0915\u093e\u0930\u094d\u092f\u093e\u0932\u092f \u0938\u092e\u092f \u092c\u0902\u0926",
    tripDate:
      "\u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0940 \u0924\u093e\u0930\u0940\u0916",
    findBestTimes:
      "\u0938\u0930\u094d\u0935\u094b\u0924\u094d\u0924\u092e \u0938\u092e\u092f \u0916\u094b\u091c\u0947\u0902",
    departure: "\u092a\u094d\u0930\u0938\u094d\u0925\u093e\u0928",
    return: "\u0935\u093e\u092a\u0938\u0940",
    checkDeparture:
      "\u0905\u092a\u0928\u093e \u092a\u094d\u0930\u0938\u094d\u0925\u093e\u0928 \u0938\u092e\u092f \u091c\u093e\u0902\u091a\u0947\u0902",
    checkReturn:
      "\u0905\u092a\u0928\u093e \u0935\u093e\u092a\u0938\u0940 \u0938\u092e\u092f \u091c\u093e\u0902\u091a\u0947\u0902",
    evaluate:
      "\u092e\u0942\u0932\u094d\u092f\u093e\u0902\u0915\u0928 \u0915\u0930\u0947\u0902",
    goodOption:
      "\u0905\u091a\u094d\u091b\u093e \u0935\u093f\u0915\u0932\u094d\u092a",
    fairOption: "\u0920\u0940\u0915 \u0935\u093f\u0915\u0932\u094d\u092a",
    notRecommended:
      "\u0905\u0928\u0941\u0936\u0902\u0938\u093f\u0924 \u0928\u0939\u0940\u0902",
    traffic: "\u092f\u093e\u0924\u093e\u092f\u093e\u0924",
    trafficLow: "\u0915\u092e",
    trafficModerate: "\u092e\u0927\u094d\u092f\u092e",
    trafficHeavy: "\u092d\u093e\u0930\u0940",
    bestOption:
      "\u2605 \u0938\u0930\u094d\u0935\u094b\u0924\u094d\u0924\u092e \u0935\u093f\u0915\u0932\u094d\u092a",
    bestAvailable:
      "\u2605 \u0909\u092a\u0932\u092c\u094d\u0927 \u0938\u0930\u094d\u0935\u094b\u0924\u094d\u0924\u092e \u0935\u093f\u0915\u0932\u094d\u092a",
    routeSummary:
      "\u092e\u093e\u0930\u094d\u0917 \u0938\u093e\u0930\u093e\u0902\u0936",
    distance: "\u0926\u0942\u0930\u0940",
    transport: "\u092a\u0930\u093f\u0935\u0939\u0928",
    bestCase:
      "\u0938\u0930\u094d\u0935\u094b\u0924\u094d\u0924\u092e \u0938\u094d\u0925\u093f\u0924\u093f",
    worstCase:
      "\u0938\u092c\u0938\u0947 \u0916\u0930\u093e\u092c \u0938\u094d\u0925\u093f\u0924\u093f",
    planAnother:
      "\u090f\u0915 \u0914\u0930 \u092f\u093e\u0924\u094d\u0930\u093e \u092f\u094b\u091c\u0928\u093e \u092c\u0928\u093e\u090f\u0902",
    setReminder:
      "\u0930\u093f\u092e\u093e\u0907\u0902\u0921\u0930 \u0938\u0947\u091f \u0915\u0930\u0947\u0902",
    reminderSet:
      "\u0930\u093f\u092e\u093e\u0907\u0902\u0921\u0930 \u0938\u0947\u091f \u0939\u0948",
    share:
      "\u092f\u093e\u0924\u094d\u0930\u093e \u0938\u093e\u091d\u093e \u0915\u0930\u0947\u0902",
    profile: "\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932",
    savedPlaces:
      "\u0938\u0939\u0947\u091c\u0947 \u0917\u090f \u0938\u094d\u0925\u093e\u0928",
    history: "\u0907\u0924\u093f\u0939\u093e\u0938",
    saveChanges:
      "\u092c\u0926\u0932\u093e\u0935 \u0938\u0939\u0947\u091c\u0947\u0902",
    signOut: "\u0938\u093e\u0907\u0928 \u0906\u0909\u091f",
    username:
      "\u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e \u0928\u093e\u092e",
    email: "\u0908\u092e\u0947\u0932",
    getStarted: "\u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    createAccount:
      "\u0905\u092a\u0928\u093e \u0916\u093e\u0924\u093e \u092c\u0928\u093e\u090f\u0902",
    onboardingSubtitle:
      "QuikLiv \u0915\u0947 \u0938\u093e\u0925 \u0938\u094d\u092e\u093e\u0930\u094d\u091f \u092f\u093e\u0924\u094d\u0930\u093e \u092f\u094b\u091c\u0928\u093e \u092c\u0928\u093e\u090f\u0902",
    password: "\u092a\u093e\u0938\u0935\u0930\u094d\u0921",
    continueBtn: "\u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902",
    tripHistory:
      "\u092f\u093e\u0924\u094d\u0930\u093e \u0907\u0924\u093f\u0939\u093e\u0938",
    noHistory:
      "\u0905\u092d\u0940 \u0924\u0915 \u0915\u094b\u0908 \u092f\u093e\u0924\u094d\u0930\u093e \u0928\u0939\u0940\u0902\u0964 \u092a\u0939\u0932\u0940 \u092f\u093e\u0924\u094d\u0930\u093e \u092f\u094b\u091c\u0928\u093e \u092c\u0928\u093e\u090f\u0902!",
    reRun: "\u092b\u093f\u0930 \u091a\u0932\u093e\u090f\u0902",
    rainExpected:
      "\ud83c\udf27 \u092c\u093e\u0930\u093f\u0936 \u0915\u0940 \u0938\u0902\u092d\u093e\u0935\u0928\u093e \u2014 \u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u092f\u093e\u0924\u094d\u0930\u093e \u0938\u092e\u092f \u091c\u094b\u0921\u093c\u0947\u0902\u0964",
  },
  ar: {
    appTagline:
      "\u0627\u0639\u0631\u0641 \u0642\u0628\u0644 \u0623\u0646 \u062a\u0630\u0647\u0628",
    weekend:
      "\u0639\u0637\u0644\u0629 \u0646\u0647\u0627\u064a\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639",
    weekday: "\u064a\u0648\u0645 \u0639\u0645\u0644",
    planYourTrip: "\u062e\u0637\u0637 \u0644\u0631\u062d\u0644\u062a\u0643",
    origin:
      "\u0646\u0642\u0637\u0629 \u0627\u0644\u0627\u0646\u0637\u0644\u0627\u0642",
    destination: "\u0627\u0644\u0648\u062c\u0647\u0629",
    transportMode:
      "\u0648\u0633\u064a\u0644\u0629 \u0627\u0644\u0646\u0642\u0644",
    car: "\u0633\u064a\u0627\u0631\u0629",
    bike: "\u062f\u0631\u0627\u062c\u0629",
    walk: "\u0645\u0634\u064a",
    tripType: "\u0646\u0648\u0639 \u0627\u0644\u0631\u062d\u0644\u0629",
    oneWay: "\u0627\u062a\u062c\u0627\u0647 \u0648\u0627\u062d\u062f",
    roundTrip: "\u0630\u0647\u0627\u0628 \u0648\u0625\u064a\u0627\u0628",
    officeHours:
      "\u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644",
    officeHoursOn:
      "\u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644 \u0645\u0641\u0639\u064f\u0651\u0644\u0629",
    officeHoursOff:
      "\u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644 \u0645\u0639\u0637\u064f\u0651\u0644\u0629",
    tripDate:
      "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0631\u062d\u0644\u0629",
    findBestTimes:
      "\u0625\u064a\u062c\u0627\u062f \u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u0648\u0642\u0627\u062a",
    departure: "\u0627\u0644\u0645\u063a\u0627\u062f\u0631\u0629",
    return: "\u0627\u0644\u0639\u0648\u062f\u0629",
    checkDeparture:
      "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0648\u0642\u062a \u0627\u0644\u0645\u063a\u0627\u062f\u0631\u0629",
    checkReturn:
      "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0648\u0642\u062a \u0627\u0644\u0639\u0648\u062f\u0629",
    evaluate: "\u062a\u0642\u064a\u064a\u0645",
    goodOption: "\u062e\u064a\u0627\u0631 \u062c\u064a\u062f",
    fairOption: "\u062e\u064a\u0627\u0631 \u0645\u0642\u0628\u0648\u0644",
    notRecommended: "\u063a\u064a\u0631 \u0645\u0648\u0635\u0649 \u0628\u0647",
    traffic: "\u062d\u0631\u0643\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    trafficLow: "\u062e\u0641\u064a\u0641",
    trafficModerate: "\u0645\u062a\u0648\u0633\u0637",
    trafficHeavy: "\u0643\u062b\u064a\u0641",
    bestOption: "\u2605 \u0623\u0641\u0636\u0644 \u062e\u064a\u0627\u0631",
    bestAvailable:
      "\u2605 \u0623\u0641\u0636\u0644 \u0627\u0644\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629",
    routeSummary:
      "\u0645\u0644\u062e\u0635 \u0627\u0644\u0645\u0633\u0627\u0631",
    distance: "\u0627\u0644\u0645\u0633\u0627\u0641\u0629",
    transport: "\u0627\u0644\u0646\u0642\u0644",
    bestCase: "\u0623\u0641\u0636\u0644 \u062d\u0627\u0644\u0629",
    worstCase: "\u0623\u0633\u0648\u0623 \u062d\u0627\u0644\u0629",
    planAnother:
      "\u062e\u0637\u0637 \u0644\u0631\u062d\u0644\u0629 \u0623\u062e\u0631\u0649",
    setReminder:
      "\u062a\u0639\u064a\u064a\u0646 \u062a\u0630\u0643\u064a\u0631",
    reminderSet:
      "\u062a\u0645 \u062a\u0639\u064a\u064a\u0646 \u0627\u0644\u062a\u0630\u0643\u064a\u0631",
    share:
      "\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0631\u062d\u0644\u0629",
    profile:
      "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a",
    savedPlaces:
      "\u0627\u0644\u0623\u0645\u0627\u0643\u0646 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629",
    history: "\u0627\u0644\u0633\u062c\u0644",
    saveChanges:
      "\u062d\u0641\u0638 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a",
    signOut:
      "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c",
    username:
      "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645",
    email:
      "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    getStarted: "\u0627\u0628\u062f\u0623",
    createAccount:
      "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628\u0643",
    onboardingSubtitle:
      "\u062e\u0637\u0637 \u0644\u0631\u062d\u0644\u0627\u062a \u0623\u0630\u0643\u0649 \u0645\u0639 QuikLiv",
    password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    continueBtn: "\u0645\u062a\u0627\u0628\u0639\u0629",
    tripHistory:
      "\u0633\u062c\u0644 \u0627\u0644\u0631\u062d\u0644\u0627\u062a",
    noHistory:
      "\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u062d\u0644\u0627\u062a \u0628\u0639\u062f. \u062e\u0637\u0637 \u0644\u0623\u0648\u0644 \u0631\u062d\u0644\u0629!",
    reRun: "\u0625\u0639\u0627\u062f\u0629 \u062a\u0634\u063a\u064a\u0644",
    rainExpected:
      "\ud83c\udf27 \u0645\u0646 \u0627\u0644\u0645\u062a\u0648\u0642\u0639 \u0647\u0637\u0648\u0644 \u0627\u0644\u0645\u0637\u0631 \u2014 \u0623\u0636\u0641 \u0648\u0642\u062a\u0627\u064b \u0625\u0636\u0627\u0641\u064a\u0627\u064b \u0644\u0644\u0633\u0641\u0631.",
  },
};

interface I18nContextValue {
  t: Translations;
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const I18nContext = createContext<I18nContextValue>({
  t: translations.en,
  locale: "en",
  setLocale: () => {},
});

export function useI18nState() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem("quikliv_locale") as Locale | null;
    return stored && translations[stored] ? stored : "en";
  });

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("quikliv_locale", l);
  }

  return { locale, setLocale, t: translations[locale] };
}

export function useI18n() {
  return useContext(I18nContext);
}
