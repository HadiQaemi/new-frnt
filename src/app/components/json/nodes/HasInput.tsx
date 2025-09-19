import { FC } from 'react';
import { helper } from '@/app/utils/helper';
import URLOrText from '../../shared/URLOrText';
import JsonTable from '../JsonTable';
import ImagePreview from '../../shared/ImagePreview';
import CustomPopover from '../../shared/CustomPopover';
import { usePopoverManager } from '@/app/hooks/usePopoverManager';
import { nanoid } from 'nanoid';
interface HasInputData {
    has_input?: any;
    label?: any;
    components?: any;
}
const HasInput: FC<HasInputData> = ({ has_input, label, components }) => {
    const source_table = has_input['source_table'];
    const has_expressions = has_input['has_expressions'];
    const has_parts = has_input['has_parts'];
    const source_url = has_input['source_url'];
    const source = has_input['source'];
    const comment = has_input['comment'];
    const has_characteristic = has_input['has_characteristic'];
    let character = '';
    if (has_characteristic) {
        const number_of_columns = has_characteristic['number_rows'];
        const number_of_rows = has_characteristic['number_columns'];
        if (number_of_columns && number_of_rows) {
            character = `Size: ${number_of_columns} x ${number_of_rows}`;
        }
    }

    let source_url_has_expressions = null;
    let title_has_expressions = null;
    if (has_expressions) {
        source_url_has_expressions = has_expressions['source_url'];
        title_has_expressions = has_expressions['label'];
    }

    const { activePopover, handlePopoverToggle } = usePopoverManager()
    return (
        <div>
            {label && (
                <URLOrText
                    button="Input data"
                    color="#00b050"
                    content={label}
                />
            )}

            {source_url && (
                <URLOrText
                    button={label ? '' : 'Input data'}
                    color="#00b050"
                    content={source_url}
                    type="source_url"
                    source={source}
                />
            )}

            {character && (
                <URLOrText
                    button={!label && !source_url ? 'Input data' : ''}
                    color="#00b050"
                    content={character}
                />
            )}

            {comment && (
                <URLOrText
                    button={!label && !source_url && !character ? 'Input data' : ''}
                    color="#00b050"
                    content={comment}
                />
            )}

            {!source_table && components && (
                components.map((type: any, index: number) => {
                    return (
                        helper.filterByStringMatch(components, type.label).length !== 0 ?
                            <CustomPopover
                                key={`CustomPopover-${nanoid()}`}
                                id={`popover-${type.label}`}
                                subTitle=""
                                title={type.label}
                                show={activePopover === type.label}
                                onToggle={(show) => handlePopoverToggle(type.label, show)}
                                trigger={
                                    <span key={`CustomPopover-Components-${nanoid()}`}>
                                        {index === 0 ? 'Components: ' : ', '}
                                        <span
                                            className="cursor-pointer overlay-trigger mb-2 font-bold underline"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePopoverToggle(type.label, activePopover !== type.label)
                                            }}
                                        >
                                            {type.label}
                                        </span>
                                    </span>
                                }
                            >
                                <div className="inline-block" dangerouslySetInnerHTML={{ __html: `<span class='block'>` + helper.renderIdentifiersComponentList(helper.filterByStringMatch(components, type.label)) + `</span>` }} />
                            </CustomPopover> :
                            (
                                <span key={`no-see_also-${nanoid()}`}>
                                    {index === 0 ? 'Components: ' : ', '}
                                    <span className="overlay-trigger mb-2 font-bold">
                                        {type.label}
                                    </span>
                                </span>
                            )
                    );
                })
            )}

            {source_table && (
                <JsonTable
                    Components={components}
                    data={source_table}
                    color="#00b050"
                />
            )}
            {has_expressions?.map((type: any) => {
                return <span key={type}>
                    {type['label'] && (<URLOrText color="#00b050" content={type['label'].replace(/\/\//g, "<br>")} />)}
                    <ImagePreview
                        src={type['source_url']}
                        alt=""
                        className="max-w-4xl max-h-[30rem] w-[100%] mx-5 border border-gray-400 my-5 mx-auto rounded"
                    />
                </span>
            })}

        </div>
    );
};

export default HasInput;