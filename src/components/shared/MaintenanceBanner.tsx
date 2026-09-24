import { useLocation } from 'react-router-dom';
import { useSiteFlags } from '@/lib/siteFlags';

/** A slim banner across the top of the public site and the app while maintenance is switched on in the super admin panel. */
export function MaintenanceBanner() {
  const flags = useSiteFlags();
  const { pathname } = useLocation();
  if (!flags?.flags.maintenance || pathname.startsWith('/super') || pathname.startsWith('/admin')) return null;
  return (
    <div role="status" style={{ position: 'sticky', top: 0, zIndex: 120, background: 'linear-gradient(100deg,#00B39C,#00796A 60%,#00594E)', color: '#fff', padding: '10px 16px', textAlign: 'center', font: '600 13.5px system-ui' }}>
      {flags.maintenance_text}
    </div>
  );
}
