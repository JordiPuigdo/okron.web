import 'dayjs/locale/ca';

import React from 'react';
import { SystemConfiguration } from 'app/interfaces/Config';
import WorkOrder, {
  WorkOrderEventType,
  WorkOrderPriority,
} from 'app/interfaces/workOrder';
import dayjs from 'dayjs';

interface Props {
  workOrder: WorkOrder;
  relatedWorkOrder?: WorkOrder;
  config: SystemConfiguration;
}

export const WorkOrderTicketPrint = ({
  workOrder,
  relatedWorkOrder,
  config,
}: Props) => {
  setTimeout(() => {
    //console.log(relatedWorkOrder);
  }, 200);
  if (!workOrder || !relatedWorkOrder) return null;

  const formatDate = (date?: string | null) =>
    date && date !== '0001-01-01T00:00:00Z'
      ? dayjs(date).locale('ca').format('DD/MM/YYYY HH:mm')
      : '-';

  const formatDuration = (time?: string | null) => {
    if (!time) return '-';
    // El format sol ser "HH:mm:ss.0000000" o "00:13:08.3095668"
    const clean = time.split('.')[0]; // Elimina mil·lisegons
    const parts = clean.split(':');
    if (parts.length === 3) {
      const [h, m, s] = parts.map(p => p.padStart(2, '0'));
      // Si és tot 00:00:00 mostrem "-"
      if (h === '00' && m === '00' && s === '00') return '-';
      return `${h}:${m}:${s}`;
    }
    return clean;
  };

  const parseDuration = (time?: string | null): number => {
    if (!time) return 0;
    const clean = time.split('.')[0];
    const [h, m, s] = clean.split(':').map(Number);
    return h * 3600 + m * 60 + s; // retorna segons totals
  };

  const sumDurations = (times: string[]) => {
    const totalSeconds = times
      .map(parseDuration)
      .reduce((acc, val) => acc + val, 0);
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const finishedEvent = workOrder.workOrderEvents
    ?.filter(e => e.workOrderEventType === WorkOrderEventType.Finished)
    ?.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

  const finishedDate = finishedEvent?.date ?? null;

  const allComments = [
    ...(workOrder.workOrderComments ?? []),
    ...(relatedWorkOrder?.workOrderComments ?? []),
  ];
  allComments.sort((a, b) => {
    const dateA = new Date(a.creationDate ?? a.creationDate ?? 0).getTime();
    const dateB = new Date(b.creationDate ?? b.creationDate ?? 0).getTime();
    return dateA - dateB; // más antiguo primero
  });
  const commentsGroupedByOperator =
    allComments?.reduce((acc, workOrderComment) => {
      const operatorId = workOrderComment.operator?.id ?? 'sin-operario';
      const comment = workOrderComment.comment?.trim();

      if (!comment) return acc; // ignora vacíos

      if (!acc[operatorId]) acc[operatorId] = [];
      acc[operatorId].push(comment);
      return acc;
    }, {} as Record<string, string[]>) || {};

  return (
    <div style={styles.page}>
      {/* Header corporatiu */}
      <header style={styles.header}>
        {config.company.urlLogo && (
          <img
            src={config.company.urlLogo}
            alt="Logo empresa"
            style={styles.logo}
          />
        )}
        <div style={styles.headerInfo}>
          <h1 style={styles.company}>{config.company.name}</h1>
          <h2 style={styles.title}>
            {workOrder.code} - {workOrder.description}
          </h2>
        </div>
      </header>

      {/* Informació general */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Informació general</h3>
        <table style={styles.table}>
          <colgroup>
            <col style={{ width: '40%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '40%' }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={styles.cellLabel}>Actiu / Màquina:</td>
              <td style={styles.cellValue}>
                {workOrder.asset?.description ?? '-'}
              </td>
              <td style={styles.cellLabel}>Prioritat:</td>
              <td style={styles.cellValue}>
                {workOrder.priority === WorkOrderPriority.Low
                  ? 'Baixa'
                  : workOrder.priority === WorkOrderPriority.Medium
                  ? 'Mitjana'
                  : 'Alta'}
              </td>
            </tr>

            <tr>
              <td style={styles.cellLabel}>Data de creació:</td>
              <td style={styles.cellValue}>
                {formatDate(workOrder.creationTime?.toString())}
              </td>
              <td style={styles.cellLabel}>Data de finalització:</td>
              <td style={styles.cellValue}>
                {finishedDate ? formatDate(finishedDate) : '-'}
              </td>
            </tr>

            <tr>
              <td style={styles.cellLabel}>Acció creada:</td>
              <td style={styles.cellValue} colSpan={6}>
                {relatedWorkOrder?.code ?? '-'} —{' '}
                {relatedWorkOrder?.description ?? '-'} —{' '}
                {formatDate(relatedWorkOrder?.creationTime?.toString())}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Temps i parades */}
      {workOrder.downtimes?.length ? (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Activitat</h3>

          {Object.entries(
            workOrder.downtimes.reduce((acc, dt) => {
              const operatorType = dt.operator?.operatorType ?? 0;
              if (!acc[operatorType]) acc[operatorType] = [];
              acc[operatorType].push(dt);
              return acc;
            }, {} as Record<number, typeof workOrder.downtimes>)
          ).map(([operatorType, records]) => {
            // Agrupem per nom d’operari
            const groupedByOperator = records.reduce((acc, dt) => {
              let name = dt.operator?.name ?? 'Sense nom';
              if (commentsGroupedByOperator) {
                const commentsJoinedByOperator = commentsGroupedByOperator
                  ? Object.fromEntries(
                      Object.entries(commentsGroupedByOperator).map(
                        ([operatorId, comments]) => [
                          operatorId,
                          comments.filter(c => c?.trim()).join(', '),
                        ]
                      )
                    )
                  : {};

                const operatorComments =
                  commentsJoinedByOperator[dt.operator.id];

                if (operatorComments) {
                  name += ` - (${operatorComments})`;
                }
              }

              if (!acc[name]) acc[name] = [];
              acc[name].push(dt);
              return acc;
            }, {} as Record<string, typeof records>);

            // Etiqueta segons tipus d’operari
            const operatorTypeLabel = (() => {
              switch (Number(operatorType)) {
                case 0:
                  return 'Manteniment';
                case 1:
                  return 'Producció';
                case 2:
                  return 'Qualitat';
                default:
                  return 'Altres';
              }
            })();

            return (
              <div key={operatorType} style={styles.operatorGroup}>
                <h4 style={styles.subSectionTitle}>{operatorTypeLabel}</h4>

                <table style={styles.tableFixed}>
                  <colgroup>
                    <col style={{ width: '70%' }} />
                    <col style={{ width: '30%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Operari</th>
                      <th style={styles.tableHeader}>Temps total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedByOperator).map(([name, list]) => (
                      <React.Fragment key={name}>
                        {/* Fila principal de l'operari */}
                        <tr>
                          <td style={styles.cellValue}>{name}</td>
                          <td style={styles.cellCenter}>
                            {sumDurations(list.map(d => d.totalTime ?? ''))}
                          </td>
                        </tr>

                        {/* Subtaula integrada dels intervals */}
                        <tr>
                          <td
                            colSpan={2}
                            style={{ paddingLeft: 0, paddingRight: 0 }}
                          >
                            <table style={styles.subTable}>
                              <colgroup>
                                <col style={{ width: '35%' }} />
                                <col style={{ width: '35%' }} />
                                <col style={{ width: '30%' }} />
                              </colgroup>
                              <thead>
                                <tr>
                                  <th style={styles.subHeader}>Data inici</th>
                                  <th style={styles.subHeader}>Data fi</th>
                                  <th style={styles.subHeader}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {list.map(dt => (
                                  <tr key={dt.id}>
                                    <td style={styles.subCellCenter}>
                                      {formatDate(dt.startTime)}
                                    </td>
                                    <td style={styles.subCellCenter}>
                                      {formatDate(dt.endTime)}
                                    </td>
                                    <td style={styles.subCellTotalTime}>
                                      {formatDuration(dt.totalTime)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}

                    <tr style={styles.totalRow}>
                      <td style={styles.cellRight}>
                        Total {operatorTypeLabel}
                      </td>
                      <td style={styles.cellCenter}>
                        {sumDurations(records.map(d => d.totalTime ?? ''))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}

          <div style={styles.summaryBoxAligned}>
            <table style={styles.tableFixed}>
              <colgroup>
                <col style={{ width: '70%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <td style={styles.cellRight}>Temps total global:</td>
                  <td style={styles.cellCenter}>
                    {sumDurations(
                      workOrder.downtimes.map(d => d.totalTime ?? '')
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Recanvis utilitzats */}
      {relatedWorkOrder?.workOrderSpareParts?.length ? (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Recanvis utilitzats</h3>

          <table style={styles.table}>
            <colgroup>
              <col style={{ width: '70%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Recanvi</th>
                <th style={styles.tableHeader}>Unitats</th>
              </tr>
            </thead>
            <tbody>
              {relatedWorkOrder.workOrderSpareParts.map(sp => (
                <tr key={sp.id}>
                  <td style={styles.cellValue}>
                    {sp.sparePart?.description ?? sp.sparePart?.code ?? '-'}
                  </td>
                  <td style={styles.cellCenter}>{sp.quantity ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.summaryBoxAligned}>
            <table style={styles.tableFixed}>
              <colgroup>
                <col style={{ width: '70%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <td style={styles.cellRight}>Total de recanvis:</td>
                  <td style={styles.cellCenter}>
                    {relatedWorkOrder.workOrderSpareParts.length}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Peu de pàgina */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          {config.company.name} — Generat automàticament el{' '}
          {dayjs().format('DD/MM/YYYY HH:mm')}
        </p>
      </footer>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#111',
    backgroundColor: '#fff',
    minHeight: '297mm',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '2px solid #ccc',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  logo: {
    height: '60px',
    marginRight: '20px',
  },
  headerInfo: {
    flex: 1,
  },
  company: {
    fontSize: '18px',
    fontWeight: 700,
    margin: 0,
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    margin: '2px 0',
    color: '#444',
  },
  code: {
    fontSize: '14px',
    color: '#555',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: '16px',
  },

  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0a2947',
    marginBottom: '10px',
    textTransform: 'uppercase',
    borderBottom: '2px solid #cbd5e1',
    paddingBottom: '4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  subTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 4,
    borderTop: '1px solid #d1d5db',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: 700,
    textAlign: 'center',
    border: '1px solid #d1d5db',
    padding: '6px',
    textTransform: 'uppercase',
  },
  cellLabel: {
    width: '30%',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    padding: '6px 8px',
    fontWeight: 600,
    fontSize: '13px',
    color: '#0a2947',
    textAlign: 'left',
  },
  cellValue: {
    width: '70%',
    border: '1px solid #cbd5e1',
    padding: '6px 8px',
    fontSize: '13px',
    color: '#111827',
    textAlign: 'left',
  },
  cellCenter: {
    fontSize: '13px',
    border: '1px solid #e2e8f0',
    padding: '6px 8px',
    textAlign: 'center',
    fontWeight: 600,
  },
  commentBox: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: '#fafafa',
  },
  commentText: {
    margin: 0,
    fontSize: '13px',
  },
  commentMeta: {
    fontSize: '12px',
    color: '#555',
    marginTop: '4px',
  },
  imageRow: {
    marginTop: '6px',
    display: 'flex',
    gap: '6px',
  },
  commentImage: {
    height: '80px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  footer: {
    marginTop: '30px',
    borderTop: '1px solid #ccc',
    paddingTop: '8px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '12px',
    color: '#555',
  },
  subSectionTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1e293b',
    margin: '10px 0 6px 0',
    borderBottom: '1px solid #cbd5e1',
    paddingBottom: '2px',
    textTransform: 'uppercase',
  },
  cellRight: {
    border: '1px solid #e2e8f0',
    padding: '6px 8px',
    textAlign: 'right',
    fontWeight: 600,
    fontSize: '13px',
  },
  summaryBox: {
    marginTop: '12px',
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#0f172a',
  },

  operatorGroup: {
    marginBottom: '18px',
  },

  tableFixed: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },

  totalRow: {
    backgroundColor: '#f8fafc',
    fontWeight: 700,
  },

  subHeader: {
    fontSize: 12,
    textAlign: 'center',
    color: '#1e293b',
    fontWeight: 600,
    borderBottom: '1px solid #e2e8f0',
    padding: '4px 0',
  },
  subCellCenter: {
    fontSize: 12,
    textAlign: 'center',
    color: '#334155',
    padding: '4px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  subCellTotalTime: {
    fontSize: '13px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
    padding: '6px 16px',
    fontWeight: 600,
  },
  sparePartSection: {
    marginTop: '18px',
  },

  spareHeader: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: 700,
    textAlign: 'center',
    border: '1px solid #d1d5db',
    padding: '6px',
    textTransform: 'uppercase',
  },
  spareCell: {
    fontSize: '13px',
    border: '1px solid #e2e8f0',
    padding: '6px 8px',
    color: '#1e293b',
  },
  spareCellCenter: {
    fontSize: '13px',
    border: '1px solid #e2e8f0',
    padding: '6px 8px',
    textAlign: 'center',
    color: '#1e293b',
    fontWeight: 600,
  },
};
