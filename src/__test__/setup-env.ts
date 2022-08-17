import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import '@alex_neo/jest-expect-message';
import '@abraham/reflection';
import { GlobalContextService } from '../services/injection/GlobalContextService';

GlobalContextService.SetDebug(false);
