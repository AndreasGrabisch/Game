export interface MissionData {
  id: string;
  title: string;
  part: 'wheels' | 'pedals' | 'handlebar';
  intro: string;
  learn1: string;
  learn2: string;
  success: string;
  hint: string;
}

export const MISSIONS: Record<string, MissionData> = {
  'mission-01-wheels': {
    id: 'mission-01-wheels',
    title: 'Runde Räder',
    part: 'wheels',
    intro: 'Hallo! Ich bin Samuel. Mein Fahrrad braucht Räder — aber nur runde Räder rollen richtig!',
    learn1: 'Zieh die runden Räder auf die Fahrrad-Achsen. Eckige Räder rollen nicht!',
    learn2: 'Super! Räder sind immer rund — so kann das Fahrrad rollen.',
    success: 'Toll gemacht! Mein Fahrrad hat jetzt zwei Räder!',
    hint: 'Tipp: Nur die runden Räder passen!',
  },
  'mission-02-pedals': {
    id: 'mission-02-pedals',
    title: 'Pedale & Kette',
    part: 'pedals',
    intro: 'Jetzt brauche ich Pedale! Wenn ich trete, bewegt sich die Kette und das Rad rollt.',
    learn1: 'Setze die Teile in die richtige Reihenfolge: Pedal → Kette → Rad.',
    learn2: 'Die Kette verbindet Pedal und Rad — so kommt die Kraft an!',
    success: 'Klasse! Jetzt kann ich treten und fahren!',
    hint: 'Tipp: Erst Pedal, dann Kette, dann Rad.',
  },
  'mission-03-handlebar': {
    id: 'mission-03-handlebar',
    title: 'Lenker',
    part: 'handlebar',
    intro: 'Fast fertig! Mit dem Lenker kann ich steuern, wohin ich fahren will.',
    learn1: 'Bewege den Lenker nach links und rechts — so ändert sich die Richtung!',
    learn2: 'Der Lenker ist mit dem Vorderrad verbunden.',
    success: "Mein Fahrrad ist fertig! Los geht's!",
    hint: 'Tipp: Links lenken = nach links fahren.',
  },
};
