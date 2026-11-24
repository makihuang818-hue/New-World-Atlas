import Link from "next/link";
import { AutoVideo } from "@/components/AutoVideo";
import { PubRail } from "@/components/bits";
import { PubRailCard } from "@/components/cards";
import { ClimateMap } from "@/components/climate/ClimateMap";
import { Cover } from "@/components/Cover";
import { HomeMap } from "@/components/HomeMap";
import { getChapters, getPublications } from "@/content/data";

export default async function Home() {
  const [chapters, publications] = await Promise.all([getChapters(), getPublications()]);
  return (
    <main className="page">
      <Cover />
      <HomeMap chapters={chapters} />

      <section className="intro">
        <div className="intro__text">
          <p><span className="dropcap" aria-hidden="true">G</span><span style={{ position: "absolute", left: -9999 }}>G</span>iga-fires, mega-droughts, and thousand-year floods are reshaping the American West. Using thermal and infrared imaging, this project will chronicle this growing transformation, expanding understanding and widening perceptions of this epochal change.</p>
          <p>In lands that traditional photographs depict as static and unchanging, fresh technologies have opened new layers of perception. By making heat manifest, thermal cameras render a changing climate tangible, while infrared cameras allow us to see beyond the visible spectrum and detect living tissue from dead.</p>
          <p>The sub-humid and arid lands of the American West are uniquely vulnerable to fluctuations in climate. From my home in California’s Central Valley, I have seen firsthand the impact: massive Sierra wildfires clog the air with smoke, and nearly a million acres of farmland lie abandoned for lack of water.</p>
          <p>Organized in a series of 17 chapters - one for each state lying west of the 100th meridian The New World Atlas will create a fresh vision of the land that invites us to reimagine, come to terms with, and adapt to a rapidly changing world.</p>
        </div>
      </section>

      <section className="landscape">
        <AutoVideo
          className="landscape__media"
          src="/media/landscape.mp4"
          poster="/media/landscape.jpg"
          label="Smoke-filled sky over the American West"
          still={<img src="/media/landscape.jpg" alt="Smoke-filled sky over the American West" />}
        />
      </section>

      <ClimateMap />

      {publications.length > 0 && (
        <section className="pubs">
          <div className="pubs__head"><span>Publications</span><Link href="/publications">View All</Link></div>
          <PubRail>{publications.map(p => <PubRailCard key={p.id} p={p} />)}</PubRail>
        </section>
      )}
    </main>
  );
}
