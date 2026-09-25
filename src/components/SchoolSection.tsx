const facts = [
  ["Founded", "1979"],
  ["Founder", "H.E. Daniel T. arap Moi"],
  ["Location", "Kabarak, Nakuru County, Kenya"],
  ["Motto", "“On Earth, We Rise”"],
  ["Type", "Co-educational Christian boarding school"],
  ["Principal", "Mrs. Elishebah Cheruiyot"],
];

export function SchoolSection() {
  return (
    <section id="school" className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
        <p className="text-xs uppercase tracking-widest text-primary">Our School</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">Moi High School – Kabarak</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Moi High School Kabarak (MHSK) sits about 20 km from Nakuru along the Nakuru–Eldama Ravine road,
          sharing its compound with Kabarak University and Kabarak Primary. It was founded in 1979 by Kenya's
          second president to give boys and girls from across the country a holistic education on Christian
          principles, guided by the values of commitment, fairness and integrity.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border/70 bg-background/50 p-4">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-muted-foreground">
          knox by nzoia is a student project helping the Kabarak community and beyond stay safe online. The class of
          2022 set a school record of 33 A's in KCSE.{" "}
          <a href="https://www.mhskabarak.sc.ke/" target="_blank" rel="noreferrer" className="text-primary underline">
            Visit the school website
          </a>
        </p>
      </div>
    </section>
  );
}
