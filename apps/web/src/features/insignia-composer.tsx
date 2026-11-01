import type { InsigniaRecipe, InsigniaState } from '../adapters/insignias'
import {
  compositionAppearance,
  compositionAvailable,
  elementGroups,
  freeRecipe,
  groupOf,
  selectElement,
  setElementColor,
  shuffleRecipe,
} from '../client-model/insignia-composer'
import { symbolAccess } from '../client-model/insignias'
import { Button } from '../ui/button'
import { EmpireInsignia } from './empire-insignia'
import styles from './insignia.module.css'
export function InsigniaComposer({
  snapshot,
  recipe,
  now,
  busy,
  onChange,
}: {
  snapshot: InsigniaState
  recipe: InsigniaRecipe
  now: number
  busy: boolean
  onChange: (r: InsigniaRecipe) => void
}) {
  const advanced = compositionAvailable(snapshot, now)
  return (
    <div className={styles.composer}>
      <p>
        Choose one center and one accent. Supporters can add up to two stripes
        and use three element colors.
      </p>
      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => onChange(shuffleRecipe(snapshot, recipe, now))}
        >
          Shuffle
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => onChange({ ...recipe, layers: [] })}
        >
          Clear elements
        </Button>
      </div>
      {elementGroups.map((group) => (
        <fieldset key={group} disabled={busy}>
          <legend>
            {group === 'center'
              ? 'Center'
              : group === 'stripes'
                ? 'Stripes · Supporter · Up to 2'
                : 'Accents'}
          </legend>
          <div
            className={`${styles.elementGrid} ${group === 'stripes' ? styles.stripeGrid : ''}`}
          >
            {snapshot.catalog
              .filter((e) => e.group === group)
              .sort((a, b) => Number(b.supporter) - Number(a.supporter))
              .map((item) => {
                const selected = recipe.layers?.some(
                    (l) => l.symbol === item.id,
                  ),
                  access = symbolAccess(snapshot, item.id, now)
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={item.name}
                    aria-pressed={selected}
                    disabled={
                      access !== 'available' ||
                      (group === 'stripes' && !advanced)
                    }
                    onClick={() =>
                      onChange(selectElement(snapshot, recipe, item.id))
                    }
                  >
                    <EmpireInsignia
                      appearance={compositionAppearance(snapshot, {
                        ...recipe,
                        layers: [
                          {
                            symbol: item.id,
                            color:
                              recipe.layers?.find(
                                (l) => groupOf(snapshot, l.symbol) === group,
                              )?.color ?? recipe.foreground,
                          },
                        ],
                      })}
                      size="medium"
                    />
                    <span>{item.name}</span>
                    {item.supporter && <small>Supporter</small>}
                  </button>
                )
              })}
          </div>
          {!snapshot.catalog.some((e) => e.group === group) && (
            <p>No {group} installed on this server.</p>
          )}
        </fieldset>
      ))}
      <div className={styles.colors}>
        {advanced ? (
          elementGroups.map((group) => (
            <label key={group}>
              {group === 'center'
                ? 'Center'
                : group === 'stripes'
                  ? 'Stripe'
                  : 'Accent'}{' '}
              color
              <input
                type="color"
                disabled={busy}
                value={
                  recipe.layers?.find(
                    (l) => groupOf(snapshot, l.symbol) === group,
                  )?.color ?? recipe.foreground
                }
                onChange={(e) =>
                  onChange(
                    setElementColor(snapshot, recipe, group, e.target.value),
                  )
                }
              />
            </label>
          ))
        ) : (
          <label>
            Element color
            <input
              type="color"
              disabled={busy}
              value={recipe.foreground}
              onChange={(e) =>
                onChange(
                  setElementColor(snapshot, recipe, null, e.target.value),
                )
              }
            />
          </label>
        )}
        <label>
          Background color
          <input
            type="color"
            disabled={busy}
            value={recipe.background}
            onChange={(e) =>
              onChange({ ...recipe, background: e.target.value })
            }
          />
        </label>
      </div>
      {!advanced && (
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => onChange(freeRecipe(snapshot, recipe, now))}
        >
          Use free elements and one color
        </Button>
      )}
    </div>
  )
}
