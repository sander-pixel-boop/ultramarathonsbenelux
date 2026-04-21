import { notFound } from 'next/navigation';
import Link from 'next/link';
import racesData from '../../../../races.json';

export function generateStaticParams() {
  return racesData.map((race) => ({
    slug: race.slug,
  }));
}

export function generateMetadata({ params }) {
  const race = racesData.find((r) => r.slug === params.slug);
  if (!race) return {};
  return {
    title: `${race.name} - Ultra Race Benelux`,
    description: `Details for ${race.name}, a ${race.distance} race in ${race.country}.`,
  };
}

export default function RacePage({ params }) {
  const race = racesData.find((r) => r.slug === params.slug);

  if (!race) {
    notFound();
  }

  const locationStr = race.city ? `${race.city}, ${race.country}` : race.country;

  let formattedDate = race.date;
  if (race.date && race.date.includes('.')) {
      const parts = race.date.split('.');
      if (parts.length === 3) {
          const d = new Date(parts[2], parts[1] - 1, parts[0]);
          formattedDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }
  }

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white p-5 flex justify-between items-center shadow-md">
        <Link href="/" className="font-bold text-xl hover:text-blue-300 transition-colors">
          <i className="fas fa-arrow-left mr-2"></i> Back to Calendar
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-12 w-full flex-1">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white relative">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{race.name}</h1>
                <p className="text-xl text-blue-100 flex items-center gap-2 mt-4">
                   <i className="fas fa-map-marker-alt"></i> {locationStr}
                </p>
                {race.utmb_index && (
                    <div className="absolute top-8 right-8 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                        UTMB Qualifier
                    </div>
                )}
            </div>

            <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Race Details</h3>

                        <div className="flex items-center gap-4 text-slate-700">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl shrink-0">
                                <i className="fas fa-route"></i>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Distance</p>
                                <p className="text-lg font-bold">{race.distance}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-slate-700">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl shrink-0">
                                <i className="fas fa-mountain"></i>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Elevation (D+)</p>
                                <p className="text-lg font-bold">{race.elevation ? `${race.elevation}m` : 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-slate-700">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl shrink-0">
                                <i className="far fa-calendar-alt"></i>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Date</p>
                                <p className="text-lg font-bold">{formattedDate}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Course Intelligence</h3>

                        <div className="flex items-center gap-4 text-slate-700">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl shrink-0">
                                <i className="fas fa-leaf"></i>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Terrain / Surface</p>
                                <p className="text-lg font-bold">{race.terrain || 'Mixed / Unknown'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-slate-700">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl shrink-0">
                                <i className="fas fa-comments"></i>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Language Profile</p>
                                <p className="text-lg font-bold">{race.language_profile || 'Local'}</p>
                            </div>
                        </div>

                        {race.gear_recommendation && (
                        <div className="flex items-center gap-4 text-slate-700">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xl shrink-0">
                                <i className="fas fa-headlamp"></i>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Key Gear</p>
                                <p className="text-lg font-bold">{race.gear_recommendation}</p>
                            </div>
                        </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Ready to sign up?</h3>
                    <p className="text-slate-600 mb-6">Check the official website for the latest rules, mandatory gear lists, and registration details.</p>
                    <a href={race.url} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-transform hover:scale-105 shadow-lg">
                        Visit Official Race Website <i className="fas fa-external-link-alt ml-2"></i>
                    </a>
                </div>

                {race.gear_recommendation && (
                <div className="mt-10 border-t pt-8 text-center">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Recommended Gear Partner</h4>
                    <div className="inline-flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="text-3xl text-slate-700"><i className="fas fa-shopping-bag"></i></div>
                        <div className="text-left">
                            <p className="font-bold text-slate-800 text-sm">Shop {race.gear_recommendation.split(' ')[0]} Essentials</p>
                            <p className="text-xs text-blue-500 font-semibold">View deals on running gear &rarr;</p>
                        </div>
                    </div>
                </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}
