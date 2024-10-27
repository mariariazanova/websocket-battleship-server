import { AttackResultState } from '../enums/attack-result-state';

export interface AttackResult {
  attackResultStatus: AttackResultState;
  surroundingCells?: string[];
}
