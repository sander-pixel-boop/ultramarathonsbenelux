import { notFound } from 'next/navigation';
import Link from 'next/link';
import racesData from '../../../../../races.json';

export function generateMetadata({ params }) {
  const parts = params.slugs.split('-vs-');
  if (parts.length !== 2) return {};

  const race1 = racesData.find((r) => r.slug === parts[0]);
  const race2 = racesData.find((r) => r.slug === parts[1]);

  if (!race1 || !race2) return {};

  return {
    title: `${race1.name} vs ${race2.name} - Ultra Race Comparison`,
    description: `Compare ${race1.name} and ${race2.name} to see which Benelux ultra marathon is right for you.`,
  };
}

export default function ComparePage({ params }) {
  const parts = params.slugs.split('-vs-');
  if (parts.length !== 2) {
    notFound();
  }

  const race1 = racesData.find((r) => r.slug === parts[0]);
  const race2 = racesData.find((r) => r.slug === parts[1]);

  if (!race1 || !race2) {
    notFound();
  }

  // Parse distance numeric values for simple highlights
  const dist1 = parseFloat((race1.distance || '0').replace(/[^0-9.]/g, ''));
  const dist2 = parseFloat((race2.distance || '0').replace(/[^0-9.]/g, ''));

  // Parse elevation numeric values
  const elev1 = parseInt(race1.elevation || '0');
  const elev2 = parseInt(race2.elevation || '0');

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-slate-50">

      <nav className="bg-slate-900 text-white p-5 flex justify-between items-center shadow-md">
        <Link href="/" className="font-bold text-xl hover:text-blue-300 transition-colors">
          <i className="fas fa-arrow-left mr-2"></i> Back to Calendar
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-12 w-full flex-1">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Race Comparison</h1>
            <p className="text-lg text-slate-600">Which challenge is right for you?</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                {/* VS Badge */}
                <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -ml-px justify-center items-center">
                    <div className="bg-slate-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg z-10 border-4 border-white">
                        VS
                    </div>
                </div>

                {/* Race 1 Column */}
                <div className="space-y-8 pr-0 md:pr-4">
                    <div className="text-center pb-6 border-b border-slate-100">
                        <h2 className="text-3xl font-bold text-blue-700 mb-2">{race1.name}</h2>
                        <p className="text-slate-500 font-medium"><i className="fas fa-map-marker-alt"></i> {race1.city ? `${race1.city}, ` : ''}{race1.country}</p>
                    </div>

                    <div className="space-y-4">
                        <div className={`p-4 rounded-lg border ${dist1 > dist2 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Distance</p>
                            <p className="text-2xl font-bold text-slate-800">{race1.distance}</p>
                        </div>

                        <div className={`p-4 rounded-lg border ${elev1 > elev2 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Elevation (D+)</p>
                            <p className="text-2xl font-bold text-slate-800">{race1.elevation ? `${race1.elevation}m` : 'N/A'}</p>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Terrain</p>
                            <p className="text-lg font-bold text-slate-800">{race1.terrain || 'Mixed'}</p>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">UTMB Index</p>
                                <p className="text-lg font-bold text-slate-800">{race1.utmb_index ? 'Yes' : 'No'}</p>
                            </div>
                            {race1.utmb_index && <i className="fas fa-check-circle text-green-500 text-2xl"></i>}
                        </div>

                        {race1.gear_recommendation && (
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Key Gear</p>
                            <p className="font-semibold text-slate-700">{race1.gear_recommendation}</p>
                        </div>
                        )}
                    </div>

                    <div className="text-center pt-4">
                        <Link href={`/races/${race1.slug}`} className="text-blue-600 font-bold hover:underline">
                            View full details &rarr;
                        </Link>
                    </div>
                </div>

                {/* Race 2 Column */}
                <div className="space-y-8 pl-0 md:pl-4 mt-12 md:mt-0 relative">
                    {/* Mobile VS Badge */}
                    <div className="flex md:hidden absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-900 text-white rounded-full items-center justify-center font-bold shadow-lg border-4 border-white">
                        VS
                    </div>

                    <div className="text-center pb-6 border-b border-slate-100">
                        <h2 className="text-3xl font-bold text-indigo-700 mb-2">{race2.name}</h2>
                        <p className="text-slate-500 font-medium"><i className="fas fa-map-marker-alt"></i> {race2.city ? `${race2.city}, ` : ''}{race2.country}</p>
                    </div>

                    <div className="space-y-4">
                        <div className={`p-4 rounded-lg border ${dist2 > dist1 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Distance</p>
                            <p className="text-2xl font-bold text-slate-800">{race2.distance}</p>
                        </div>

                        <div className={`p-4 rounded-lg border ${elev2 > elev1 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Elevation (D+)</p>
                            <p className="text-2xl font-bold text-slate-800">{race2.elevation ? `${race2.elevation}m` : 'N/A'}</p>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Terrain</p>
                            <p className="text-lg font-bold text-slate-800">{race2.terrain || 'Mixed'}</p>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">UTMB Index</p>
                                <p className="text-lg font-bold text-slate-800">{race2.utmb_index ? 'Yes' : 'No'}</p>
                            </div>
                            {race2.utmb_index && <i className="fas fa-check-circle text-green-500 text-2xl"></i>}
                        </div>

                        {race2.gear_recommendation && (
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Key Gear</p>
                            <p className="font-semibold text-slate-700">{race2.gear_recommendation}</p>
                        </div>
                        )}
                    </div>

                    <div className="text-center pt-4">
                        <Link href={`/races/${race2.slug}`} className="text-indigo-600 font-bold hover:underline">
                            View full details &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
