import { useParams } from 'react-router-dom';
import CrudManager from '../components/CrudManager';
import { ENTITIES } from '../config/entities';

export default function ReferencePage() {
  const { resource } = useParams();
  const config = ENTITIES[resource];

  if (!config) return <p>Ressource inconnue : {resource}</p>;

  // key force le remontage du CrudManager quand on change de ressource
  return <CrudManager key={resource} resource={resource} title={config.title} fields={config.fields} />;
}
